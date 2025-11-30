import { useCallback } from 'react';
import { getSystemNameByCore } from '@/lib/constants';
import { Game } from '@/types';

interface GameOperations {
    editingGame: Game | null;
    pendingGame: any;
    pendingFiles: any[];
    pendingBatchCore: string | null;
    systemPickerOpen: boolean;
    systemPickerClosing: boolean;
    setEditingGame: (game: Game | null) => void;
    setPendingGame: (game: any) => void;
    setPendingBatchCore: (core: string | null) => void;
    setCoverArtFit: (fit: 'cover' | 'contain') => void;
    setSystemPickerOpen: (open: boolean) => void;
    closeSystemPicker: () => void;
    showDuplicateError: (message: string) => void;
    extractFilesFromDataTransfer: (dt: DataTransfer) => File[];
}

interface GameLibrary {
    games: Game[];
    updateGame: (id: number, updates: Partial<Game>) => void;
}

interface FileHandler {
    setIsProcessing: (processing: boolean) => void;
    processGameFile: (file: File, index: number, core: string, meta?: any) => Promise<void>;
    handleIncomingFiles: (files: File[]) => Promise<void>;
}

export function useSystemPickerFlow(ops: GameOperations, lib: GameLibrary, files: FileHandler) {

    const handleSystemPickerDone = useCallback(async () => {
        // handle edit mode
        if (ops.editingGame) {
            lib.updateGame(ops.editingGame.id, ops.editingGame);
            ops.closeSystemPicker();
            return;
        }

        // validate core selection
        const effectiveCore = ops.pendingFiles.length > 1 ? ops.pendingBatchCore : ops.pendingGame?.core;
        if (!effectiveCore) {
            return ops.showDuplicateError("Please select a system");
        }

        // check duplicates
        if (ops.pendingFiles.length === 1 && lib.games.some((g: any) => g.fileName === ops.pendingFiles[0].file.name)) {
            ops.showDuplicateError(`"${ops.pendingFiles[0].file.name}" is duplicate`);
            return ops.closeSystemPicker();
        }

        // process batch upload
        const filesToProcess = [...ops.pendingFiles];
        const meta = ops.pendingGame ? { ...ops.pendingGame } : undefined;

        ops.closeSystemPicker();
        files.setIsProcessing(true);

        try {
            await Promise.all(filesToProcess.map((f: any, idx: number) =>
                files.processGameFile(f.file, idx === 0 && meta ? 0 : f.index, effectiveCore, idx === 0 ? meta : undefined)
            ));
        } catch (e) {
            console.error("batch error:", e);
        } finally {
            files.setIsProcessing(false);
        }
    }, [ops, lib.games, files, lib.updateGame]);

    const handleEditGame = useCallback((g: any) => {
        ops.setEditingGame(g);
        ops.setPendingGame({ ...g });
        ops.setCoverArtFit(g.coverArtFit || 'cover');
        ops.setSystemPickerOpen(true);
    }, [ops]);

    const onSelectSystem = useCallback((core: string) => {
        if (ops.pendingFiles.length > 1) {
            ops.setPendingBatchCore(core);
        } else {
            const update = { core, genre: getSystemNameByCore(core) };
            if (ops.editingGame) {
                ops.setEditingGame({ ...ops.editingGame, ...update });
            }
            if (ops.pendingGame) {
                ops.setPendingGame({ ...ops.pendingGame, ...update });
            }
        }
    }, [ops]);

    const onRename = useCallback((title: string) => {
        if (ops.editingGame) {
            ops.setEditingGame({ ...ops.editingGame, title });
        } else if (ops.pendingGame) {
            ops.setPendingGame({ ...ops.pendingGame, title });
        }
    }, [ops]);

    return { handleSystemPickerDone, handleEditGame, onSelectSystem, onRename };
}