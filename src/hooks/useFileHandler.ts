import { useState, useCallback, useRef } from 'react';
import { Game } from '@/types';
import { saveGameFile, getGameFile } from '@/lib/storage';
import { getSystemNameByCore } from '@/lib/constants';
import { delay, PROGRESS_THROTTLE_MS, stripExt } from '@/lib/utils';
import { calculateAutoCoverArt } from '@/lib/files';

interface FileHandlerOps {
    showDuplicateError: (msg: string) => void;
    setPendingFiles: (files: Array<{ file: File; index: number }>) => void;
    setPendingGame: (game: Partial<Game> | null) => void;
    setSystemPickerOpen: (open: boolean) => void;
    setCoverArtFit: (fit: 'cover' | 'contain') => void;
    coverArtFit: 'cover' | 'contain';
    setPendingBatchCore: (core: string | null) => void;
}

let idCounter = 0;
const uniqueId = () => Date.now() * 1000 + (idCounter++ % 1000);

export function useFileHandler(games: Game[], addGame: (game: Game) => void, ops: FileHandlerOps) {
    const [uploads, setUploads] = useState<Record<number, Game>>({});
    const [isProcessing, setIsProcessing] = useState(false);
    const snapshots = useRef<Record<number, Game>>({});
    const active = useRef<Set<number>>(new Set());

    const patchUpload = useCallback((id: number, patch: Partial<Game>) => {
        setUploads(prev => {
            if (!prev[id]) return prev;
            const updated = { ...prev[id], ...patch };
            snapshots.current[id] = updated;
            return { ...prev, [id]: updated };
        });
    }, []);

    const processGameFile = useCallback(async (file: File, core: string, meta?: Partial<Game>) => {
        const gameId = uniqueId();
        const systemName = meta?.genre || getSystemNameByCore(core);
        const initialCover = meta?.coverArt;

        const tempGame: Game = {
            id: gameId,
            title: meta?.title || stripExt(file.name),
            genre: systemName,
            filePath: meta?.filePath || file.name,
            fileName: file.name,
            core,
            coverArt: initialCover,
            autoCoverArt: undefined,
            coverArtFit: initialCover ? (meta?.coverArtFit || ops.coverArtFit) : undefined,
            progress: 0,
        };

        active.current.add(gameId);
        snapshots.current[gameId] = tempGame;
        setUploads(prev => ({ ...prev, [gameId]: tempGame }));

        try {
            let lastUpdate = 0;
            await saveGameFile(gameId, file, progress => {
                if (!active.current.has(gameId)) return;
                const now = Date.now();
                if (now - lastUpdate > PROGRESS_THROTTLE_MS || progress >= 100) {
                    patchUpload(gameId, { progress });
                    lastUpdate = now;
                }
            });

            // Save done — progress sits at 100% while we hash.
            // Hash the OPFS copy to avoid read contention with the original File.
            patchUpload(gameId, { progress: 100 });
            const opfsFile = await getGameFile(gameId).catch(() => null);
            const cover = await calculateAutoCoverArt(file, core, opfsFile ?? undefined).catch(() => null);

            // Apply cover before the overlay fades out so it's visible immediately
            if (cover && active.current.has(gameId)) {
                const existing = snapshots.current[gameId];
                if (existing && (!existing.coverArt || existing.coverArt === existing.autoCoverArt)) {
                    const updated = { ...existing, coverArt: cover, autoCoverArt: cover, coverArtFit: existing.coverArtFit || ops.coverArtFit };
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
            setUploads(prev => { const { [gameId]: _, ...rest } = prev; return rest; });
        }
    }, [addGame, ops, patchUpload]);

    const handleIncomingFiles = useCallback(async (files: File[]) => {
        if (!files.length) return;
        const existing = new Set(games.flatMap(g => [g.fileName, g.filePath].filter(Boolean)));
        const fresh = files.filter(f => !existing.has(f.name));

        if (!fresh.length) {
            ops.showDuplicateError(files.length === 1 ? 'File already in library' : 'Selected files are duplicates');
            return;
        }

        ops.setPendingFiles(fresh.map((file, index) => ({ file, index })));
        ops.setPendingGame(fresh.length === 1
            ? { id: Date.now(), title: stripExt(fresh[0].name), genre: 'Unknown', filePath: fresh[0].name, fileName: fresh[0].name }
            : null
        );
        ops.setPendingBatchCore(null);
        ops.setCoverArtFit('cover');
        ops.setSystemPickerOpen(true);
    }, [games, ops]);

    return { uploads, processGameFile, handleIncomingFiles, isProcessing, setIsProcessing };
}
