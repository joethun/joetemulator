import { useCallback } from 'react';
import { Game } from '@/types';
import { getGameFile, saveGameFile } from '@/lib/storage';
import { loadGame } from '@/lib/emulator';

interface LauncherSettings {
    selectedTheme: string;
    autoLoadState: boolean;
    autoSaveState: boolean;
    autoSaveInterval: number;
}

export function useGameLauncher(settings: LauncherSettings) {
    const handlePlayClick = useCallback(async (game: Game) => {
        try {
            let file = await getGameFile(game.id);

            if (!file && game.fileData) {
                const blob = await (await fetch(game.fileData)).blob();
                file = new File([blob], game.fileName || game.title, { type: 'application/octet-stream' });
                await saveGameFile(game.id, file);
            }

            if (!file || !game.core) {
                console.error('missing file or core:', game);
                return;
            }

            await loadGame(
                file, game.core, settings.selectedTheme,
                settings.autoLoadState, settings.autoSaveState,
                settings.autoSaveInterval * 1000
            );
        } catch (error) {
            console.error('launch failed:', error);
        }
    }, [settings]);

    return { handlePlayClick };
}