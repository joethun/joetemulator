import { useCallback } from 'react';
import { getSystemNameByCore } from '@/lib/constants';

export function useSystemPickerFlow(ops: any, lib: any, files: any) {

    const handleSystemPickerDone = useCallback(async () => {
        // 1. handle edit mode
        if (ops.editingGame) {
            ops.closeSystemPicker();
            return;
        }

        // 2. validate core selection
        const effectiveCore = ops.pendingFiles.length > 1 ? ops.pendingBatchCore : ops.pendingGame?.core;
        if (!effectiveCore) {
            return ops.showDuplicateError("please select a system");
        }

        // 3. check duplicates for single manual adds
        if (ops.pendingFiles.length === 1 && lib.games.some((g: any) => g.fileName === ops.pendingFiles[0].file.name)) {
            ops.showDuplicateError(`"${ops.pendingFiles[0].file.name}" is duplicate`);
            return ops.closeSystemPicker();
        }

        // 4. process batch
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
    }, [ops, lib.games, files]);

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
                lib.updateGame(ops.editingGame.id, update);
                ops.setEditingGame({ ...ops.editingGame, ...update });
            }
            if (ops.pendingGame) {
                ops.setPendingGame({ ...ops.pendingGame, ...update });
            }
        }
    }, [ops, lib]);

    return { handleSystemPickerDone, handleEditGame, onSelectSystem };
}