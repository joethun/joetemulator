import { useCallback } from 'react';
import { Game } from '@/types';
import { getGameFile, saveGameFile } from '@/lib/storage';
import { loadGame } from '@/lib/emulator';

// settings required for launching games
interface LauncherSettings {
    selectedTheme: string;
    autoLoadState: boolean;
    autoSaveState: boolean;
    autoSaveInterval: number;
}

/**
 * handles launching games in the emulator
 */
export function useGameLauncher(settings: LauncherSettings) {
    const handlePlayClick = useCallback(async (game: Game) => {
        try {
            let file = await getGameFile(game.id);

            // migrate legacy base64 game data on first play
            if (!file && game.fileData) {
                const response = await fetch(game.fileData);
                const blob = await response.blob();
                file = new File([blob], game.fileName || game.title, {
                    type: 'application/octet-stream'
                });
                await saveGameFile(game.id, file);
            }

            if (!file) {
                console.error('game file missing:', game);
                return;
            }

            if (!game.core) {
                console.error('game core missing:', game);
                return;
            }

            await loadGame(
                file,
                game.core,
                settings.selectedTheme,
                settings.autoLoadState,
                settings.autoSaveState,
                settings.autoSaveInterval * 1000
            );
        } catch (error) {
            console.error('launch failed:', error);
        }
    }, [settings]);

    return { handlePlayClick };
}