import { useState, useCallback } from 'react';
import { Game } from '@/types';
import { saveGameFile } from '@/lib/storage';
import { getSystemNameByCore } from '@/lib/constants';
import { delay, PROGRESS_THROTTLE_MS } from '@/lib/utils';

// operations required from parent for file handling
export interface FileHandlerOperations {
    showDuplicateError: (msg: string) => void;
    setPendingFiles: (files: Array<{ file: File; index: number }>) => void;
    setPendingGame: (game: Partial<Game> | null) => void;
    setSystemPickerOpen: (open: boolean) => void;
    setCoverArtFit: (fit: 'cover' | 'contain') => void;
    coverArtFit: 'cover' | 'contain';
    setPendingBatchCore: (core: string | null) => void;
}

/**
 * handles file uploads and game processing
 */
export function useFileHandler(
    games: Game[],
    addGame: (game: Game) => void,
    ops: FileHandlerOperations
) {
    const [uploads, setUploads] = useState<Record<number, Game>>({});
    const [isProcessing, setIsProcessing] = useState(false);

    // process a single game file upload
    const processGameFile = useCallback(async (
        file: File,
        index: number,
        core: string,
        meta?: Partial<Game>
    ) => {
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
                // throttle progress updates to avoid excessive re-renders
                if (now - lastUpdate > PROGRESS_THROTTLE_MS || progress >= 100) {
                    setUploads(prev =>
                        prev[gameId] ? { ...prev, [gameId]: { ...prev[gameId], progress } } : prev
                    );
                    lastUpdate = now;
                }
            });

            // show completion state
            setUploads(prev => ({ ...prev, [gameId]: { ...prev[gameId], progress: 100 } }));
            await delay(800);

            setUploads(prev => ({ ...prev, [gameId]: { ...prev[gameId], isComplete: true } }));
            await delay(300);

            // add to library without upload metadata
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

    // handle incoming files from drag/drop or file picker
    const handleIncomingFiles = useCallback(async (files: File[]) => {
        if (!files.length) return;

        // filter out duplicates
        const existingNames = new Set(
            games.flatMap(g => [g.fileName, g.filePath].filter(Boolean))
        );

        const needsSystem = files
            .map((file, i) => ({ file, index: i }))
            .filter(({ file }) => !existingNames.has(file.name));

        if (!needsSystem.length) {
            const message = files.length === 1
                ? 'File already in library'
                : 'Selected files are duplicates';
            ops.showDuplicateError(message);
            return;
        }

        // setup system picker for new files
        ops.setPendingFiles(needsSystem);
        ops.setPendingGame(
            needsSystem.length === 1
                ? {
                    id: Date.now(),
                    title: needsSystem[0].file.name.replace(/\.[^/.]+$/, ''),
                    genre: 'Unknown',
                    filePath: needsSystem[0].file.name,
                    fileName: needsSystem[0].file.name
                }
                : null
        );
        ops.setPendingBatchCore(null);
        ops.setCoverArtFit('cover');
        ops.setSystemPickerOpen(true);
    }, [games, ops]);

    return {
        uploads,
        processGameFile,
        handleIncomingFiles,
        isProcessing,
        setIsProcessing
    };
}