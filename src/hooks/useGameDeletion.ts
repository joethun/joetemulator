import { useCallback } from 'react';
import { Game } from '@/types';
import { delay, ANIM_DELAY } from '@/lib/utils';

// library operations interface
interface GameLibrary {
    deleteGame: (id: number) => Promise<void>;
}

// ui state interface
interface UIState {
    selectedGameIds: Set<number>;
    setDeletingGameIds: (fn: Set<number> | ((prev: Set<number>) => Set<number>)) => void;
    exitDeleteMode: () => void;
}

/**
 * handles game deletion with animation support
 */
export function useGameDeletion(lib: GameLibrary, ui: UIState) {
    // delete a single game with confirmation
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

    // delete multiple selected games
    const onMassDelete = useCallback(async () => {
        if (!ui.selectedGameIds.size) return;
        if (!confirm(`Delete ${ui.selectedGameIds.size} games?`)) return;

        ui.setDeletingGameIds(new Set(ui.selectedGameIds));
        await delay(ANIM_DELAY);
        await Promise.all(
            [...ui.selectedGameIds].map(id => lib.deleteGame(id))
        );
        ui.exitDeleteMode();
        ui.setDeletingGameIds(new Set());
    }, [lib, ui]);

    return { handleDeleteGame, onMassDelete };
}