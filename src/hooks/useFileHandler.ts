import { useState, useCallback } from 'react';
import { Game } from '@/types';
import { saveGameFile } from '@/lib/storage';
import { getSystemNameByCore } from '@/lib/constants';

// utilities
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const stripExtension = (filename: string) => filename.replace(/\.[^/.]+$/, '');
const getFileExtension = (filename: string) => filename.split(".").pop()?.toLowerCase() || "";

// interface for operations needed by this hook
interface GameOperations {
    showDuplicateError: (msg: string) => void;
    setPendingFiles: (files: any[]) => void;
    setPendingGame: (game: any) => void;
    setSystemPickerOpen: (open: boolean) => void;
    setCoverArtFit: (fit: 'cover' | 'contain') => void;
    coverArtFit: 'cover' | 'contain';
    getSystemFromExtension: (ext: string) => string | null;
    setPendingBatchCore: (core: string | null) => void;
}

export function useFileHandler(
    games: Game[],
    addGame: (game: Game) => void,
    ops: GameOperations
) {
    const [uploads, setUploads] = useState<Record<number, Game>>({});
    const [isProcessing, setIsProcessing] = useState(false);

    // check if file already exists
    const isDuplicate = useCallback((fileName: string) =>
        games.some(g => g.fileName === fileName || g.filePath === fileName), [games]);

    // update progress state during upload
    const updateUploadProgress = useCallback((gameId: number, progress: number) => {
        setUploads(prev => prev[gameId] ? { ...prev, [gameId]: { ...prev[gameId], progress } } : prev);
    }, []);

    // handle single file upload sequence
    const processGameFile = useCallback(async (file: File, index: number, core: string, meta?: Partial<Game>) => {
        const gameId = Date.now() + index + Math.floor(Math.random() * 1000);
        const tempGame: Game = {
            id: gameId,
            title: meta?.title || stripExtension(file.name),
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
                // throttle updates to prevent ui thrashing
                if (now - lastUpdate > 100 || progress === 100 || progress === 0) {
                    updateUploadProgress(gameId, progress);
                    lastUpdate = now;
                }
            });

            updateUploadProgress(gameId, 100);
            await delay(800); // allow animation to finish
            setUploads(prev => ({ ...prev, [gameId]: { ...prev[gameId], isComplete: true } }));
            await delay(300);

            // remove temp fields before saving
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

        const categorized = files.reduce((acc, file, i) => {
            if (isDuplicate(file.name)) {
                acc.duplicates.push(file.name);
            } else {
                const core = ops.getSystemFromExtension(getFileExtension(file.name));
                if (core) acc.withCore.push({ file, index: i, core });
                else acc.needsSystem.push({ file, index: i });
            }
            return acc;
        }, { withCore: [] as any[], needsSystem: [] as any[], duplicates: [] as string[] });

        if (categorized.duplicates.length && !categorized.withCore.length && !categorized.needsSystem.length) {
            ops.showDuplicateError(categorized.duplicates.length === 1 ? 'file already in library' : 'selected files are duplicates');
            return;
        }

        // process files where core is known
        categorized.withCore.forEach(f => processGameFile(f.file, f.index, f.core));

        // open picker for files needing system
        if (categorized.needsSystem.length) {
            ops.setPendingFiles(categorized.needsSystem);
            ops.setPendingGame(categorized.needsSystem.length === 1 ? {
                id: Date.now(),
                title: stripExtension(categorized.needsSystem[0].file.name),
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