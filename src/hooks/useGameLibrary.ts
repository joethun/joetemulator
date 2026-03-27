import { useState, useCallback, useRef } from 'react';
import { Game } from '@/types';
import { saveGameFile, deleteGameFile } from '@/lib/storage';
import { getSystemNameByCore } from '@/lib/constants';
import { STORAGE_KEYS } from '@/lib/utils';

const persist = (games: Game[]) => localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(games));

const updateAndPersist = (prev: Game[], fn: (games: Game[]) => Game[]) => {
  const next = fn(prev);
  persist(next);
  return next;
};

export function useGameLibrary() {
  const [games, setGames] = useState<Game[]>([]);
  const migrated = useRef(false);

  const loadGamesFromStorage = useCallback(async () => {
    if (migrated.current) return;
    migrated.current = true;

    try {
      const raw = localStorage.getItem(STORAGE_KEYS.GAMES);
      if (!raw) return;

      const parsed: Game[] = JSON.parse(raw);

      // one-time migration: legacy base64 -> OPFS
      if (localStorage.getItem(STORAGE_KEYS.GAMES_MIGRATED) !== 'true') {
        for (const game of parsed.filter(g => g.fileData)) {
          try {
            const blob = await (await fetch(game.fileData!)).blob();
            await saveGameFile(game.id, new File([blob], game.fileName || game.title, { type: 'application/octet-stream' }));
          } catch {}
        }
        localStorage.setItem(STORAGE_KEYS.GAMES_MIGRATED, 'true');
      }

      const cleaned = parsed.map(({ fileData, ...rest }) => ({
        ...rest,
        genre: rest.genre === 'ROM' && rest.core ? getSystemNameByCore(rest.core) : rest.genre,
        coverArtFit: rest.coverArt && !rest.coverArtFit ? 'cover' as const : rest.coverArtFit
      }));

      setGames(cleaned);
      persist(cleaned);
    } catch {
      setGames([]);
    }
  }, []);

  const addGame = useCallback((game: Game) => {
    setGames(prev => updateAndPersist(prev, g => [...g, game]));
  }, []);

  const updateGame = useCallback((id: number, updates: Partial<Game>) => {
    setGames(prev => updateAndPersist(prev, g => g.map(x => x.id === id ? { ...x, ...updates } : x)));
  }, []);

  const deleteGame = useCallback(async (id: number) => {
    try { await deleteGameFile(id); } catch {}
    setGames(prev => updateAndPersist(prev, g => g.filter(x => x.id !== id)));
  }, []);

  return { games, loadGamesFromStorage, addGame, updateGame, deleteGame };
}