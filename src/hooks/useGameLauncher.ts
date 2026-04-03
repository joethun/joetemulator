import { useCallback } from 'react';
import { Game } from '@/types';
import { getGameFile, saveGameFile } from '@/lib/storage';
import { loadGame, getSlotKeys } from '@/lib/emulator';
import { NEXT_LOAD_KEY } from '@/lib/savestates';
import { stripExt } from '@/lib/utils';

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

            const baseName = stripExt(game.fileName || game.title);
            const slots = getSlotKeys(baseName);
            const nextLoadSlot = slots.find(k => localStorage.getItem(NEXT_LOAD_KEY + k));
            if (nextLoadSlot) localStorage.removeItem(NEXT_LOAD_KEY + nextLoadSlot);

            await loadGame(file, game.core, selectedTheme, autoLoadState || !!nextLoadSlot, autoSaveState, autoSaveInterval * 1000, baseName, nextLoadSlot);
        } catch (err) {
            console.error('launch failed:', err);
        }
    }, [selectedTheme, autoLoadState, autoSaveState, autoSaveInterval]);

    return { handlePlayClick };
}
