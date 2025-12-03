import { useState, useCallback } from 'react';
import { Game } from '@/types';
import { saveGameFile } from '@/lib/storage';
import { getSystemNameByCore } from '@/lib/constants';

// interface for dependencies
interface GameOperations {
    showDuplicateError: (msg: string) => void;
    setPendingFiles: (files: any[]) => void;
    setPendingGame: (game: any) => void;
    setSystemPickerOpen: (open: boolean) => void;
    setCoverArtFit: (fit: 'cover' | 'contain') => void;
    coverArtFit: 'cover' | 'contain';
    setPendingBatchCore: (core: string | null) => void;
}

export function useFileHandler(
    games: Game[],
    addGame: (game: Game) => void,
    ops: GameOperations
) {
    const [uploads, setUploads] = useState<Record<number, Game>>({});
    const [isProcessing, setIsProcessing] = useState(false);

    // check for duplicate file
    const isDuplicate = useCallback((fileName: string) =>
        games.some(g => g.fileName === fileName || g.filePath === fileName), [games]);

    // update upload progress
    const updateUploadProgress = useCallback((gameId: number, progress: number) => {
        setUploads(prev => prev[gameId] ? { ...prev, [gameId]: { ...prev[gameId], progress } } : prev);
    }, []);

    const processGameFile = useCallback(async (file: File, index: number, core: string, meta?: Partial<Game>) => {
        const gameId = Date.now() + index + Math.floor(Math.random() * 1000);
        const tempGame: Game = {
            id: gameId,
            title: meta?.title || file.name.replace(/\.[^/.]+$/, ''),
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
            await saveGameFile(gameId, file, (progress) => {
                const now = Date.now();
                // throttle updates
                if (now - lastUpdate > 100 || progress === 100 || progress === 0) {
                    updateUploadProgress(gameId, progress);
                    lastUpdate = now;
                }
            });

            updateUploadProgress(gameId, 100);
            await new Promise(r => setTimeout(r, 800)); // animation completion
            setUploads(prev => ({ ...prev, [gameId]: { ...prev[gameId], isComplete: true } }));
            await new Promise(r => setTimeout(r, 300));

            // remove temp fields
            const newGame = { ...tempGame };
            delete newGame.progress;
            delete newGame.isComplete;
            addGame(newGame);
        } catch (e) {
            console.error("upload failed", e);
        } finally {
            setUploads(prev => {
                const rest = { ...prev };
                delete rest[gameId];
                return rest;
            });
        }
    }, [addGame, ops.coverArtFit, updateUploadProgress]);

    // process dropped or selected files
    const handleIncomingFiles = useCallback(async (files: File[]) => {
        if (!files.length) return;

        // categorize files - check for duplicates only
        const duplicates: string[] = [];
        const needsSystem: { file: File; index: number }[] = [];

        files.forEach((file, i) => {
            if (isDuplicate(file.name)) {
                duplicates.push(file.name);
            } else {
                needsSystem.push({ file, index: i });
            }
        });

        // if all files are duplicates, show error
        if (duplicates.length && !needsSystem.length) {
            ops.showDuplicateError(duplicates.length === 1 ? 'File already in library' : 'Selected files are duplicates');
            return;
        }

        // open system picker for all non-duplicate files
        if (needsSystem.length) {
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
        }
    }, [isDuplicate, ops, processGameFile]);

    return {
        uploads,
        processGameFile,
        handleIncomingFiles,
        isProcessing,
        setIsProcessing
    };
}