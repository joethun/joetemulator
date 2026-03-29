import { useState, useCallback, useRef } from 'react';
import { Game } from '@/types';
import { saveGameFile, deleteGameFile, migrateLegacyRoms } from '@/lib/storage';
import { getSystemNameByCore } from '@/lib/constants';
import { STORAGE_KEYS } from '@/lib/utils';

const persist = (games: Game[]) => {
    try {
        localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(games));
    } catch (e) {
        console.error('Failed to persist games:', e);
    }
};

const update = (prev: Game[], fn: (games: Game[]) => Game[]) => {
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
      await migrateLegacyRoms(parsed);

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
    setGames(prev => update(prev, (g: Game[]) => [...g, game]));
  }, []);

  const updateGame = useCallback((id: number, updates: Partial<Game>) => {
    setGames(prev => update(prev, (g: Game[]) => g.map((x: Game) => x.id === id ? { ...x, ...updates } : x)));
  }, []);

  const deleteGame = useCallback(async (id: number) => {
    try { await deleteGameFile(id); } catch {}
    setGames(prev => update(prev, (g: Game[]) => g.filter((x: Game) => x.id !== id)));
  }, []);

  return { games, loadGamesFromStorage, addGame, updateGame, deleteGame };
}