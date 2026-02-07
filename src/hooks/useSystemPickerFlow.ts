import { useCallback } from 'react';
import { getSystemNameByCore } from '@/lib/constants';
import { Game } from '@/types';

// operations state from useGameOperations
interface OperationsState {
    editingGame: Game | null;
    pendingGame: Partial<Game> | null;
    pendingFiles: Array<{ file: File; index: number }>;
    pendingBatchCore: string | null;
    setEditingGame: (game: Game | null) => void;
    setPendingGame: (game: Partial<Game> | null) => void;
    setPendingBatchCore: (core: string | null) => void;
    setCoverArtFit: (fit: 'cover' | 'contain') => void;
    setSystemPickerOpen: (open: boolean) => void;
    closeSystemPicker: () => void;
    showDuplicateError: (message: string) => void;
}

// library operations
interface LibraryState {
    games: Game[];
    updateGame: (id: number, updates: Partial<Game>) => void;
}

// file handling operations
interface FileState {
    setIsProcessing: (processing: boolean) => void;
    processGameFile: (file: File, index: number, core: string, meta?: Partial<Game>) => Promise<void>;
}

/**
 * handles system picker workflow and game editing
 */
export function useSystemPickerFlow(ops: OperationsState, lib: LibraryState, files: FileState) {
    // complete the system picker flow
    const handleSystemPickerDone = useCallback(async () => {
        // handle editing existing game
        if (ops.editingGame) {
            lib.updateGame(ops.editingGame.id, ops.editingGame);
            ops.closeSystemPicker();
            return;
        }

        // determine which core to use
        const core = ops.pendingFiles.length > 1
            ? ops.pendingBatchCore
            : ops.pendingGame?.core;

        if (!core) {
            ops.showDuplicateError("Please select a system");
            return;
        }

        // check for duplicates in single file mode
        if (ops.pendingFiles.length === 1) {
            const isDuplicate = lib.games.some(
                g => g.fileName === ops.pendingFiles[0].file.name
            );
            if (isDuplicate) {
                ops.showDuplicateError(`"${ops.pendingFiles[0].file.name}" is duplicate`);
                ops.closeSystemPicker();
                return;
            }
        }

        ops.closeSystemPicker();
        files.setIsProcessing(true);

        try {
            const meta = ops.pendingGame ? { ...ops.pendingGame } : undefined;

            await Promise.all(
                ops.pendingFiles.map((item, index) =>
                    files.processGameFile(
                        item.file,
                        index === 0 && meta ? 0 : item.index,
                        core,
                        index === 0 ? meta : undefined
                    )
                )
            );
        } catch (error) {
            console.error("batch processing error:", error);
        } finally {
            files.setIsProcessing(false);
        }
    }, [ops, lib, files]);

    // open system picker for editing a game
    const handleEditGame = useCallback((game: Game) => {
        ops.setEditingGame(game);
        ops.setPendingGame({ ...game });
        ops.setCoverArtFit(game.coverArtFit || 'cover');
        ops.setSystemPickerOpen(true);
    }, [ops]);

    // handle system selection
    const onSelectSystem = useCallback((core: string) => {
        const update = {
            core,
            genre: getSystemNameByCore(core)
        };

        if (ops.pendingFiles.length > 1) {
            // batch mode: just set the core
            ops.setPendingBatchCore(core);
        } else {
            // single mode: update the editing/pending game
            if (ops.editingGame) {
                ops.setEditingGame({ ...ops.editingGame, ...update });
            }
            if (ops.pendingGame) {
                ops.setPendingGame({ ...ops.pendingGame, ...update });
            }
        }
    }, [ops]);

    // handle game rename
    const onRename = useCallback((title: string) => {
        if (ops.editingGame) {
            ops.setEditingGame({ ...ops.editingGame, title });
        } else if (ops.pendingGame) {
            ops.setPendingGame({ ...ops.pendingGame, title });
        }
    }, [ops]);

    return {
        handleSystemPickerDone,
        handleEditGame,
        onSelectSystem,
        onRename
    };
}