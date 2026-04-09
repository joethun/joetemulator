import { useCallback } from 'react';
import { Game } from '@/types';
import { selectFiles } from '@/lib/files';

interface Lib {
    games: Game[];
    updateGame: (id: number, updates: Partial<Game>) => void;
    deleteGame: (id: number, fileName?: string, title?: string) => Promise<void>;
}

interface Files {
    handleIncomingFiles: (files: File[]) => Promise<void>;
}

export function useGameActions(lib: Lib, files: Files) {
    const handleAddGame = useCallback(async () => {
        try {
            const selected = await selectFiles();
            await files.handleIncomingFiles(selected);
        } catch (err) {
            if (err instanceof Error && err.name !== 'AbortError') console.error(err);
        }
    }, [files]);

    const handleUploadCover = useCallback((id: number, data: string) => {
        lib.updateGame(id, { coverArt: data });
    }, [lib]);

    const handleResetCover = useCallback((id: number) => {
        const game = lib.games.find(x => x.id === id);
        if (game?.autoCoverArt) lib.updateGame(id, { coverArt: game.autoCoverArt });
    }, [lib]);

    const handleDeleteGame = useCallback(async (game: Game) => {
        if (!confirm(`Delete "${game.title}"?`)) return;
        await lib.deleteGame(game.id, game.fileName, game.title);
    }, [lib]);

    return { handleAddGame, handleUploadCover, handleResetCover, handleDeleteGame };
}
