import { useCallback } from 'react';
import { Game } from '@/types';
import { delay, ANIM_DELAY } from '@/lib/utils';

interface Lib { deleteGame: (id: number) => Promise<void>; }

interface App {
    selectedGameIds: Set<number>;
    setDeletingGameIds: (fn: Set<number> | ((prev: Set<number>) => Set<number>)) => void;
    exitDeleteMode: () => void;
}

export function useGameDeletion(lib: Lib, app: App) {
    const handleDeleteGame = useCallback(async (game: Game) => {
        if (!confirm(`Delete "${game.title}"?`)) return;

        app.setDeletingGameIds(prev => new Set(prev).add(game.id));
        await delay(ANIM_DELAY);
        await lib.deleteGame(game.id);
        app.setDeletingGameIds(prev => {
            const next = new Set(prev);
            next.delete(game.id);
            return next;
        });
    }, [lib, app]);

    const onMassDelete = useCallback(async () => {
        if (!app.selectedGameIds.size || !confirm(`Delete ${app.selectedGameIds.size} games?`)) return;

        app.setDeletingGameIds(new Set(app.selectedGameIds));
        await delay(ANIM_DELAY);
        await Promise.all([...app.selectedGameIds].map(id => lib.deleteGame(id)));
        app.exitDeleteMode();
        app.setDeletingGameIds(new Set());
    }, [lib, app]);

    return { handleDeleteGame, onMassDelete };
}