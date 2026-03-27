import { useState, useCallback } from 'react';
import { Game } from '@/types';
import { saveGameFile } from '@/lib/storage';
import { getSystemNameByCore } from '@/lib/constants';
import { delay, PROGRESS_THROTTLE_MS } from '@/lib/utils';

interface FileHandlerOps {
    showDuplicateError: (msg: string) => void;
    setPendingFiles: (files: Array<{ file: File; index: number }>) => void;
    setPendingGame: (game: Partial<Game> | null) => void;
    setSystemPickerOpen: (open: boolean) => void;
    setCoverArtFit: (fit: 'cover' | 'contain') => void;
    coverArtFit: 'cover' | 'contain';
    setPendingBatchCore: (core: string | null) => void;
}

const stripExt = (name: string) => name.replace(/\.[^/.]+$/, '');

export function useFileHandler(games: Game[], addGame: (game: Game) => void, ops: FileHandlerOps) {
    const [uploads, setUploads] = useState<Record<number, Game>>({});
    const [isProcessing, setIsProcessing] = useState(false);

    const processGameFile = useCallback(async (file: File, index: number, core: string, meta?: Partial<Game>) => {
        const gameId = Date.now() + index + Math.floor(Math.random() * 1000);
        const tempGame: Game = {
            id: gameId,
            title: meta?.title || stripExt(file.name),
            genre: meta?.genre || getSystemNameByCore(core),
            filePath: meta?.filePath || file.name,
            fileName: file.name,
            core,
            coverArt: meta?.coverArt,
            coverArtFit: meta?.coverArt ? (meta.coverArtFit || ops.coverArtFit) : undefined,
            progress: 0
        };

        setUploads(prev => ({ ...prev, [gameId]: tempGame }));

        try {
            let lastUpdate = 0;
            await saveGameFile(gameId, file, progress => {
                const now = Date.now();
                if (now - lastUpdate > PROGRESS_THROTTLE_MS || progress >= 100) {
                    setUploads(prev => prev[gameId] ? { ...prev, [gameId]: { ...prev[gameId], progress } } : prev);
                    lastUpdate = now;
                }
            });

            setUploads(prev => ({ ...prev, [gameId]: { ...prev[gameId], progress: 100 } }));
            await delay(800);
            setUploads(prev => ({ ...prev, [gameId]: { ...prev[gameId], isComplete: true } }));
            await delay(300);

            addGame({ ...tempGame, progress: undefined, isComplete: undefined });
        } catch (error) {
            console.error("upload failed:", error);
        } finally {
            setUploads(prev => {
                const { [gameId]: _, ...rest } = prev;
                return rest;
            });
        }
    }, [addGame, ops.coverArtFit]);

    const handleIncomingFiles = useCallback(async (files: File[]) => {
        if (!files.length) return;

        const existing = new Set(games.flatMap(g => [g.fileName, g.filePath].filter(Boolean)));
        const fresh = files.map((file, i) => ({ file, index: i })).filter(({ file }) => !existing.has(file.name));

        if (!fresh.length) {
            ops.showDuplicateError(files.length === 1 ? 'File already in library' : 'Selected files are duplicates');
            return;
        }

        ops.setPendingFiles(fresh);
        ops.setPendingGame(
            fresh.length === 1
                ? { id: Date.now(), title: stripExt(fresh[0].file.name), genre: 'Unknown', filePath: fresh[0].file.name, fileName: fresh[0].file.name }
                : null
        );
        ops.setPendingBatchCore(null);
        ops.setCoverArtFit('cover');
        ops.setSystemPickerOpen(true);
    }, [games, ops]);

    return { uploads, processGameFile, handleIncomingFiles, isProcessing, setIsProcessing };
}