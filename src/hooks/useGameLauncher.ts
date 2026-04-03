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

export function useGameLauncher({ selectedTheme, autoLoadState, autoSaveState, autoSaveInterval }: LauncherSettings) {
    const handlePlayClick = useCallback(async (game: Game) => {
        try {
            let file = await getGameFile(game.id);
            if (!file && game.fileData) {
                const blob = await (await fetch(game.fileData)).blob();
                file = new File([blob], game.fileName || game.title, { type: 'application/octet-stream' });
                await saveGameFile(game.id, file);
            }
            if (!file || !game.core) { console.error('missing file or core:', game); return; }
            await loadGame(file, game.core, selectedTheme, autoLoadState, autoSaveState, autoSaveInterval * 1000);
        } catch (err) {
            console.error('launch failed:', err);
        }
    }, [selectedTheme, autoLoadState, autoSaveState, autoSaveInterval]);

    return { handlePlayClick };
}
