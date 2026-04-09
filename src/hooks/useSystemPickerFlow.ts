import { useCallback } from 'react';
import { getSystemNameByCore } from '@/lib/constants';
import { Game } from '@/types';
import { prewarmDat } from '@/lib/files';

interface Ops {
    editingGame: Game | null;
    pendingGame: Partial<Game> | null;
    pendingFiles: Array<{ file: File; index: number }>;
    pendingBatchCore: string | null;
    setEditingGame: (game: Game | null) => void;
    setPendingGame: (game: Partial<Game> | null) => void;
    setPendingBatchCore: (core: string | null) => void;
    setSystemPickerOpen: (open: boolean) => void;
    closeSystemPicker: () => void;
    showDuplicateError: (message: string) => void;
}

interface Lib {
    games: Game[];
    updateGame: (id: number, updates: Partial<Game>) => void;
}

interface Files {
    processGameFile: (file: File, core: string, meta?: Partial<Game>) => Promise<void>;
}

export function useSystemPickerFlow(ops: Ops, lib: Lib, files: Files) {
    const handleSystemPickerDone = useCallback(async () => {
        if (ops.editingGame) {
            lib.updateGame(ops.editingGame.id, ops.editingGame);
            ops.closeSystemPicker();
            return;
        }

        const core = ops.pendingFiles.length > 1 ? ops.pendingBatchCore : ops.pendingGame?.core;
        if (!core) { ops.showDuplicateError('Please select a system'); return; }

        if (ops.pendingFiles.length === 1 && lib.games.some(g => g.fileName === ops.pendingFiles[0].file.name)) {
            ops.showDuplicateError(`"${ops.pendingFiles[0].file.name}" is duplicate`);
            ops.closeSystemPicker();
            return;
        }

        ops.closeSystemPicker();
        try {
            const meta = ops.pendingGame ? { ...ops.pendingGame } : undefined;
            await Promise.all(ops.pendingFiles.map((item, i) =>
                files.processGameFile(item.file, core, i === 0 ? meta : undefined)
            ));
        } catch (err) {
            console.error('batch processing error:', err);
        }
    }, [ops, lib, files]);

    const handleEditGame = useCallback((game: Game) => {
        ops.setEditingGame(game);
        ops.setPendingGame({ ...game });
        ops.setSystemPickerOpen(true);
    }, [ops]);

    const onSelectSystem = useCallback((core: string) => {
        const update = { core, genre: getSystemNameByCore(core) };
        // Prewarm the DAT fetch so it's cached by the time Done is pressed
        prewarmDat(core);
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
