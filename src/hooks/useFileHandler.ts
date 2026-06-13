import { useState, useCallback, useRef } from 'react';
import { Game, PendingFile } from '@/types';
import { saveGameFile, getGameFile } from '@/lib/rom-storage';
import { getSystemNameByCore } from '@/lib/constants';
import { calculateAutoCoverArt, prewarmDat } from '@/lib/files';
import { detectDiscSet, listZippedDiscs, zippedDiscSources, type DiscSet, type DiscSource } from '@/lib/discs';
import { detectPendingCore } from '@/lib/detect';
import { gameFileNames, pendingFileNames, stripExt } from '@/lib/utils';
import { useUnloadWarning } from '@/hooks/useUnloadWarning';

const PROGRESS_THROTTLE_MS = 100;
const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

interface FileHandlerOps {
    showDuplicateError: (msg: string) => void;
    setPendingFiles: (files: PendingFile[]) => void;
    setPendingGame: (game: Partial<Game> | null) => void;
    openSystemPicker: () => void;
    setPendingBatchCore: (core: string | null) => void;
}

let idCounter = 0;
const uniqueId = () => Date.now() * 1000 + (idCounter++ % 1000);

export function useFileHandler(games: Game[], addGame: (game: Game) => void, ops: FileHandlerOps) {
    const [uploads, setUploads] = useState<Record<number, Game>>({});
    const snapshots = useRef<Record<number, Game>>({});
    const active = useRef<Set<number>>(new Set());
    const { showDuplicateError, setPendingFiles, setPendingGame, openSystemPicker, setPendingBatchCore } = ops;

    // Warn before the tab closes/refreshes while uploads are in flight so a
    // half-written game file isn't abandoned.
    useUnloadWarning(Object.keys(uploads).length > 0);

    const patchUpload = useCallback((id: number, patch: Partial<Game>) => {
        setUploads(prev => {
            if (!prev[id]) return prev;
            const updated = { ...prev[id], ...patch };
            snapshots.current[id] = updated;
            return { ...prev, [id]: updated };
        });
    }, []);

    const processGameFile = useCallback(async (item: PendingFile, core: string, meta?: Partial<Game>) => {
        const gameId = uniqueId();
        const systemName = meta?.genre || getSystemNameByCore(core);
        const initialCover = meta?.coverArt;
        // Zipped discs are extracted here, inside the visible upload — doing it
        // at drop time is what made the system picker slow to appear.
        const discs: DiscSource[] = item.zip
            ? zippedDiscSources(item.zip, item.discs)
            : item.files.map(f => ({ name: f.name, size: f.size, open: async () => f }));
        const primaryName = discs[0].name;

        const tempGame: Game = {
            id: gameId,
            title: meta?.title || stripExt(primaryName),
            genre: systemName,
            fileName: primaryName,
            discNames: discs.length > 1 ? discs.map(d => d.name) : undefined,
            core,
            coverArt: initialCover,
            autoCoverArt: undefined,
            coverArtFit: initialCover ? (meta?.coverArtFit || 'cover') : undefined,
            progress: 0,
        };

        active.current.add(gameId);
        snapshots.current[gameId] = tempGame;
        setUploads(prev => ({ ...prev, [gameId]: tempGame }));

        try {
            let lastUpdate = 0;
            const reportProgress = (progress: number) => {
                if (!active.current.has(gameId)) return;
                const now = Date.now();
                if (now - lastUpdate > PROGRESS_THROTTLE_MS || progress >= 100) {
                    patchUpload(gameId, { progress });
                    lastUpdate = now;
                }
            };
            // Overall progress spans every disc, weighted by file size. A Blob
            // source reports through the chunked OPFS write; a deflating zip
            // entry streams through the write in a single pass and reports as
            // it inflates.
            const totalBytes = discs.reduce((sum, d) => sum + d.size, 0) || 1;
            let doneBytes = 0;
            for (const [disc, d] of discs.entries()) {
                const discProgress = (percent: number) =>
                    reportProgress(Math.round(((doneBytes + (d.size * percent) / 100) / totalBytes) * 100));
                const data = await d.open(discProgress);
                await saveGameFile(gameId, data, data instanceof Blob ? discProgress : undefined, disc);
                doneBytes += d.size;
            }

            // Save done — progress sits at 100% while we hash.
            // Hash the OPFS copy to avoid read contention with the original File;
            // for a zipped set it also stands in for the never-materialized
            // primary, renamed so name-based cover matching still works.
            patchUpload(gameId, { progress: 100 });
            const opfsFile = await getGameFile(gameId).catch(() => null);
            const hashSource = item.files?.[0] ?? (opfsFile ? new File([opfsFile], primaryName) : null);
            const cover = hashSource
                ? await calculateAutoCoverArt(hashSource, core, opfsFile ?? undefined).catch(() => null)
                : null;

            // Apply cover before the overlay fades out so it's visible immediately
            if (cover && active.current.has(gameId)) {
                const existing = snapshots.current[gameId];
                if (existing && (!existing.coverArt || existing.coverArt === existing.autoCoverArt)) {
                    const updated = { ...existing, coverArt: cover, autoCoverArt: cover, coverArtFit: existing.coverArtFit || 'cover' };
                    snapshots.current[gameId] = updated;
                    setUploads(prev => prev[gameId] ? { ...prev, [gameId]: updated } : prev);
                }
            }

            // Now dismiss the overlay
            await delay(800);
            patchUpload(gameId, { isComplete: true });
            await delay(300);

            if (active.current.has(gameId)) {
                const final = snapshots.current[gameId];
                if (final) addGame({ ...final, progress: undefined, isComplete: undefined });
            }
        } catch (err) {
            console.error('upload failed:', err);
        } finally {
            active.current.delete(gameId);
            delete snapshots.current[gameId];
            setUploads(prev => { const next = { ...prev }; delete next[gameId]; return next; });
        }
    }, [addGame, patchUpload]);

    const handleIncomingFiles = useCallback(async (files: File[]) => {
        if (!files.length) return;
        // In-flight uploads count as existing too, so re-adding a file mid-upload
        // can't produce two library entries.
        const existing = new Set(
            [...games, ...Object.values(uploads)].flatMap(gameFileNames),
        );

        const finish = async <T extends { name: string }>(
            incoming: T[], zipSet: DiscSet<T> | null, toPending: (group: T[]) => PendingFile,
        ) => {
            const fresh = incoming.filter(f => !existing.has(f.name));
            if (!fresh.length) {
                showDuplicateError(files.length === 1 ? 'File already in library' : 'Selected files are duplicates');
                return;
            }

            // A loose multi-file selection only groups when it looks like one
            // multi-disc set (or one cue/bin disc); a zip set is taken as-is
            // unless dedupe dropped part of it.
            const discSet = zipSet && fresh.length === incoming.length ? zipSet : detectDiscSet(fresh);
            const pending: PendingFile[] = discSet
                ? [toPending(discSet.files)]
                : fresh.map(f => toPending([f]));

            // Auto-detect a system per game from its file extension (and, for a
            // lone zip, its contents). Anything that resolves unambiguously is
            // added straight away; the rest fall through to the picker.
            const cores = await Promise.all(pending.map(detectPendingCore));
            const manual: PendingFile[] = [];
            cores.forEach((core, i) => {
                if (core) { prewarmDat(core); processGameFile(pending[i], core); }
                else manual.push(pending[i]);
            });
            if (!manual.length) return;

            const primaryName = pendingFileNames(manual[0])[0];
            setPendingFiles(manual);
            setPendingGame(manual.length === 1
                ? {
                    id: Date.now(),
                    title: discSet?.title || stripExt(primaryName),
                    genre: 'Unknown',
                    fileName: primaryName,
                }
                : null
            );
            setPendingBatchCore(null);
            openSystemPicker();
        };

        // A single zip of disc images unpacks into one game: the zip is an
        // explicit container, so its discs group regardless of how the entries
        // are named, titled after the zip itself. Only the entry list is read
        // here — extraction waits until the user confirms, so the system picker
        // opens without paying for the decompression. A zip already in the
        // library by its own name is a known duplicate and skips even the
        // listing.
        if (files.length === 1 && !existing.has(files[0].name)) {
            const zipSet = await listZippedDiscs(files[0]);
            if (zipSet) {
                const zip = files[0];
                await finish(zipSet.files, zipSet, discs => ({ zip, discs }));
                return;
            }
        }
        await finish(files, null, group => ({ files: group }));
    }, [games, uploads, showDuplicateError, setPendingFiles, setPendingGame, setPendingBatchCore, openSystemPicker, processGameFile]);

    return { uploads, processGameFile, handleIncomingFiles };
}
