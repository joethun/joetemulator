import { useCallback } from 'react';
import { Game } from '@/types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useGameDeletion(lib: any, ui: any) {

    const handleDeleteGame = useCallback(async (game: Game) => {
        if (!confirm(`Delete "${game.title}"?`)) return;

        ui.setDeletingGameIds((prev: Set<number>) => new Set(prev).add(game.id));
        await delay(350); // wait for animation
        await lib.deleteGame(game.id);

        ui.setDeletingGameIds((prev: Set<number>) => {
            const n = new Set(prev);
            n.delete(game.id);
            return n;
        });
    }, [lib, ui]);

    const onMassDelete = useCallback(async () => {
        if (!ui.selectedGameIds.size || !confirm(`Delete ${ui.selectedGameIds.size} games?`)) return;

        ui.setDeletingGameIds(new Set(ui.selectedGameIds));
        await delay(350);
        await Promise.all([...ui.selectedGameIds].map((id: number) => lib.deleteGame(id)));

        ui.exitDeleteMode();
        ui.setDeletingGameIds(new Set());
    }, [lib, ui]);

    return { handleDeleteGame, onMassDelete };
}