import { useCallback } from 'react';
import { Game } from '@/types';
import { getGameFile, saveGameFile } from '@/lib/storage';
import { loadGame } from '@/lib/emulator';

export function useGameLauncher(settings: any) {
    const handlePlayClick = useCallback(async (game: Game) => {
        try {
            let file = await getGameFile(game.id);

            // handle legacy games stored as base64 string in json
            if (!file && game.fileData) {
                const res = await fetch(game.fileData);
                file = new File([await res.blob()], game.fileName || game.title, { type: 'application/octet-stream' });
                await saveGameFile(game.id, file);
            }

            if (file && game.core) {
                await loadGame(
                    file,
                    game.core,
                    settings.selectedTheme,
                    settings.autoLoadState,
                    settings.autoSaveState,
                    settings.autoSaveInterval * 1000
                );
            } else {
                if (!file) console.error('game file missing', game);
                if (!game.core) console.error('game core missing', game);
            }
        } catch (e) {
            console.error('launch failed', e);
        }
    }, [settings]);

    return { handlePlayClick };
}