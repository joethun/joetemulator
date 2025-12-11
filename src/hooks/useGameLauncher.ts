import { useCallback } from 'react';
import { Game } from '@/types';
import { getGameFile, saveGameFile } from '@/lib/storage';
import { loadGame } from '@/lib/emulator';

export function useGameLauncher(settings: any) {
    const handlePlayClick = useCallback(async (game: Game) => {
        try {
            let file = await getGameFile(game.id);

            // migrate legacy base64 game data on first play
            if (!file && game.fileData) {
                const blob = await (await fetch(game.fileData)).blob();
                file = new File([blob], game.fileName || game.title, { type: 'application/octet-stream' });
                await saveGameFile(game.id, file);
            }

            if (!file || !game.core) {
                console.error(!file ? 'game file missing' : 'game core missing', game);
                return;
            }

            await loadGame(file, game.core, settings.selectedTheme, settings.autoLoadState, settings.autoSaveState, settings.autoSaveInterval * 1000);
        } catch (e) {
            console.error('launch failed', e);
        }
    }, [settings]);

    return { handlePlayClick };
}