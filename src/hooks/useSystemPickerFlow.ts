import { useCallback } from 'react';
import { getSystemNameByCore } from '@/lib/constants';
import { Game } from '@/types';

interface Ops {
    editingGame: Game | null;
    pendingGame: any;
    pendingFiles: any[];
    pendingBatchCore: string | null;
    setEditingGame: (g: Game | null) => void;
    setPendingGame: (g: any) => void;
    setPendingBatchCore: (c: string | null) => void;
    setCoverArtFit: (f: 'cover' | 'contain') => void;
    setSystemPickerOpen: (o: boolean) => void;
    closeSystemPicker: () => void;
    showDuplicateError: (m: string) => void;
}

interface Lib {
    games: Game[];
    updateGame: (id: number, u: Partial<Game>) => void;
}

interface Files {
    setIsProcessing: (p: boolean) => void;
    processGameFile: (f: File, i: number, c: string, m?: any) => Promise<void>;
}

export function useSystemPickerFlow(ops: Ops, lib: Lib, files: Files) {
    const handleSystemPickerDone = useCallback(async () => {
        if (ops.editingGame) {
            lib.updateGame(ops.editingGame.id, ops.editingGame);
            ops.closeSystemPicker();
            return;
        }

        const core = ops.pendingFiles.length > 1 ? ops.pendingBatchCore : ops.pendingGame?.core;

        if (!core) { ops.showDuplicateError("Please select a system"); return; }
        if (ops.pendingFiles.length === 1 && lib.games.some(g => g.fileName === ops.pendingFiles[0].file.name)) {
            ops.showDuplicateError(`"${ops.pendingFiles[0].file.name}" is duplicate`);
            ops.closeSystemPicker();
            return;
        }

        ops.closeSystemPicker();
        files.setIsProcessing(true);

        try {
            const meta = ops.pendingGame ? { ...ops.pendingGame } : undefined;
            await Promise.all(ops.pendingFiles.map((f, i) =>
                files.processGameFile(f.file, i === 0 && meta ? 0 : f.index, core, i === 0 ? meta : undefined)
            ));
        } catch (e) {
            console.error("batch error:", e);
        } finally {
            files.setIsProcessing(false);
        }
    }, [ops, lib, files]);

    const handleEditGame = useCallback((g: Game) => {
        ops.setEditingGame(g);
        ops.setPendingGame({ ...g });
        ops.setCoverArtFit(g.coverArtFit || 'cover');
        ops.setSystemPickerOpen(true);
    }, [ops]);

    const onSelectSystem = useCallback((core: string) => {
        const update = { core, genre: getSystemNameByCore(core) };
        if (ops.pendingFiles.length > 1) {
            ops.setPendingBatchCore(core);
        } else {
            if (ops.editingGame) ops.setEditingGame({ ...ops.editingGame, ...update });
            if (ops.pendingGame) ops.setPendingGame({ ...ops.pendingGame, ...update });
        }
    }, [ops]);

    const onRename = useCallback((title: string) => {
        if (ops.editingGame) ops.setEditingGame({ ...ops.editingGame, title });
        else if (ops.pendingGame) ops.setPendingGame({ ...ops.pendingGame, title });
    }, [ops]);

    return { handleSystemPickerDone, handleEditGame, onSelectSystem, onRename };
}