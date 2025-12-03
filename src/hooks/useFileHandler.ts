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
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { progress, isComplete, ...newGame } = tempGame;
            addGame(newGame);
        } catch (e) {
            console.error("upload failed", e);
        } finally {
            setUploads(prev => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { [gameId]: _, ...rest } = prev;
                return rest;
            });
        }
    }, [addGame, ops.coverArtFit, updateUploadProgress]);

    // process dropped or selected files
    const handleIncomingFiles = useCallback(async (files: File[]) => {
        if (!files.length) return;

        // categorize files - check for duplicates only
        const categorized = files.reduce((acc, file, i) => {
            if (isDuplicate(file.name)) {
                acc.duplicates.push(file.name);
            } else {
                // all non-duplicate files need system selection
                acc.needsSystem.push({ file, index: i });
            }
            return acc;
        }, { needsSystem: [] as any[], duplicates: [] as string[] });

        // if all files are duplicates, show error
        if (categorized.duplicates.length && !categorized.needsSystem.length) {
            ops.showDuplicateError(categorized.duplicates.length === 1 ? 'file already in library' : 'selected files are duplicates');
            return;
        }

        // open system picker for all non-duplicate files
        if (categorized.needsSystem.length) {
            ops.setPendingFiles(categorized.needsSystem);
            ops.setPendingGame(categorized.needsSystem.length === 1 ? {
                id: Date.now(),
                title: categorized.needsSystem[0].file.name.replace(/\.[^/.]+$/, ''),
                genre: 'Unknown',
                filePath: categorized.needsSystem[0].file.name,
                fileName: categorized.needsSystem[0].file.name
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