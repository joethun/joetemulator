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

function validateSelection(core: string | null | undefined, files: any[], games: Game[]): string | null {
    if (!core) return "Please select a system";
    if (files.length === 1 && games.some(g => g.fileName === files[0].file.name)) {
        return `"${files[0].file.name}" is duplicate`;
    }
    return null;
}

async function processBatch(files: any[], core: string, pendingGame: any, processFile: any) {
    const filesToProcess = [...files];
    const meta = pendingGame ? { ...pendingGame } : undefined;

    await Promise.all(filesToProcess.map((f: any, idx: number) =>
        processFile(f.file, idx === 0 && meta ? 0 : f.index, core, idx === 0 ? meta : undefined)
    ));
}

export function useSystemPickerFlow(ops: GameOperations, lib: GameLibrary, files: FileHandler) {

    const handleSystemPickerDone = useCallback(async () => {
        if (ops.editingGame) {
            lib.updateGame(ops.editingGame.id, ops.editingGame);
            ops.closeSystemPicker();
            return;
        }

        const effectiveCore = ops.pendingFiles.length > 1 ? ops.pendingBatchCore : ops.pendingGame?.core;
        const error = validateSelection(effectiveCore, ops.pendingFiles, lib.games);

        if (error) {
            ops.showDuplicateError(error);
            if (error.includes("duplicate")) ops.closeSystemPicker();
            return;
        }

        ops.closeSystemPicker();
        files.setIsProcessing(true);

        try {
            await processBatch(ops.pendingFiles, effectiveCore!, ops.pendingGame, files.processGameFile);
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