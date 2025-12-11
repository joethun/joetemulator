import { useState, useCallback } from 'react';
import { Game } from '@/types';
import { saveGameFile } from '@/lib/storage';
import { getSystemNameByCore } from '@/lib/constants';

interface GameOperations {
    showDuplicateError: (msg: string) => void;
    setPendingFiles: (files: any[]) => void;
    setPendingGame: (game: any) => void;
    setSystemPickerOpen: (open: boolean) => void;
    setCoverArtFit: (fit: 'cover' | 'contain') => void;
    coverArtFit: 'cover' | 'contain';
    setPendingBatchCore: (core: string | null) => void;
}

export function useFileHandler(games: Game[], addGame: (game: Game) => void, ops: GameOperations) {
    const [uploads, setUploads] = useState<Record<number, Game>>({});
    const [isProcessing, setIsProcessing] = useState(false);

    const processGameFile = useCallback(async (file: File, index: number, core: string, meta?: Partial<Game>) => {
        const gameId = Date.now() + index + Math.floor(Math.random() * 1000);
        const title = meta?.title || file.name.replace(/\.[^/.]+$/, '');
        const tempGame: Game = {
            id: gameId,
            title,
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
                if (now - lastUpdate > 100 || progress >= 100) {
                    setUploads(prev => prev[gameId] ? { ...prev, [gameId]: { ...prev[gameId], progress } } : prev);
                    lastUpdate = now;
                }
            });

            setUploads(prev => ({ ...prev, [gameId]: { ...prev[gameId], progress: 100 } }));
            await new Promise(r => setTimeout(r, 800));
            setUploads(prev => ({ ...prev, [gameId]: { ...prev[gameId], isComplete: true } }));
            await new Promise(r => setTimeout(r, 300));

            addGame({ ...tempGame, progress: undefined, isComplete: undefined });
        } catch (e) {
            console.error("upload failed", e);
        } finally {
            setUploads(prev => {
                const { [gameId]: _, ...rest } = prev;
                return rest;
            });
        }
    }, [addGame, ops.coverArtFit]);

    const handleIncomingFiles = useCallback(async (files: File[]) => {
        if (!files.length) return;

        const existingNames = new Set(games.flatMap(g => [g.fileName, g.filePath].filter(Boolean)));
        const needsSystem = files
            .map((file, i) => ({ file, index: i }))
            .filter(({ file }) => !existingNames.has(file.name));

        if (!needsSystem.length) {
            ops.showDuplicateError(files.length === 1 ? 'File already in library' : 'Selected files are duplicates');
            return;
        }

        ops.setPendingFiles(needsSystem);
        ops.setPendingGame(needsSystem.length === 1 ? {
            id: Date.now(),
            title: needsSystem[0].file.name.replace(/\.[^/.]+$/, ''),
            genre: 'Unknown',
            filePath: needsSystem[0].file.name,
            fileName: needsSystem[0].file.name
        } : null);
        ops.setPendingBatchCore(null);
        ops.setCoverArtFit('cover');
        ops.setSystemPickerOpen(true);
    }, [games, ops]);

    return { uploads, processGameFile, handleIncomingFiles, isProcessing, setIsProcessing };
}