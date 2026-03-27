import { useCallback } from 'react';
import { Game } from '@/types';
import { delay, ANIM_DELAY } from '@/lib/utils';

interface Lib { deleteGame: (id: number) => Promise<void>; }

interface UI {
    selectedGameIds: Set<number>;
    setDeletingGameIds: (fn: Set<number> | ((prev: Set<number>) => Set<number>)) => void;
    exitDeleteMode: () => void;
}

export function useGameDeletion(lib: Lib, ui: UI) {
    const handleDeleteGame = useCallback(async (game: Game) => {
        if (!confirm(`Delete "${game.title}"?`)) return;

        ui.setDeletingGameIds(prev => new Set(prev).add(game.id));
        await delay(ANIM_DELAY);
        await lib.deleteGame(game.id);
        ui.setDeletingGameIds(prev => {
            const next = new Set(prev);
            next.delete(game.id);
            return next;
        });
    }, [lib, ui]);

    const onMassDelete = useCallback(async () => {
        if (!ui.selectedGameIds.size || !confirm(`Delete ${ui.selectedGameIds.size} games?`)) return;

        ui.setDeletingGameIds(new Set(ui.selectedGameIds));
        await delay(ANIM_DELAY);
        await Promise.all([...ui.selectedGameIds].map(id => lib.deleteGame(id)));
        ui.exitDeleteMode();
        ui.setDeletingGameIds(new Set());
    }, [lib, ui]);

    return { handleDeleteGame, onMassDelete };
}