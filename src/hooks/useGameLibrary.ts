import { useState, useCallback, useRef } from 'react';
import { Game } from '@/types';
import { saveGameFile, deleteGameFile } from '@/lib/storage';
import { getSystemNameByCore } from '@/lib/constants';

const STORAGE_KEY = 'games';
const MIGRATION_KEY = 'games_migrated_v1';

// helper to persist games to storage
const persistGames = (games: Game[]) => localStorage.setItem(STORAGE_KEY, JSON.stringify(games));

export function useGameLibrary() {
  const [games, setGames] = useState<Game[]>([]);
  const migrationCheckedRef = useRef(false);

  const loadGamesFromStorage = useCallback(async () => {
    if (migrationCheckedRef.current) return;
    migrationCheckedRef.current = true;

    try {
      const savedGames = localStorage.getItem(STORAGE_KEY);
      if (!savedGames) return;

      const parsed: Game[] = JSON.parse(savedGames);

      // migrate legacy base64 to opfs (one-time)
      if (localStorage.getItem(MIGRATION_KEY) !== 'true') {
        for (const g of parsed.filter(g => g.fileData)) {
          try {
            const blob = await (await fetch(g.fileData!)).blob();
            await saveGameFile(g.id, new File([blob], g.fileName || g.title, { type: 'application/octet-stream' }));
          } catch { /* skip failed migrations */ }
        }
        localStorage.setItem(MIGRATION_KEY, 'true');
      }

      // clean and normalize game data
      const cleaned = parsed.map(g => {
        const { fileData, ...rest } = g;
        return {
          ...rest,
          genre: g.genre === 'ROM' && g.core ? getSystemNameByCore(g.core) : g.genre,
          coverArtFit: g.coverArt && !g.coverArtFit ? 'cover' as const : g.coverArtFit
        };
      });

      setGames(cleaned);
      persistGames(cleaned);
    } catch {
      setGames([]);
    }
  }, []);

  const addGame = useCallback((game: Game) => {
    setGames(prev => {
      const next = [...prev, game];
      persistGames(next);
      return next;
    });
  }, []);

  const updateGame = useCallback((id: number, updates: Partial<Game>) => {
    setGames(prev => {
      const next = prev.map(g => g.id === id ? { ...g, ...updates } : g);
      persistGames(next);
      return next;
    });
  }, []);

  const deleteGame = useCallback(async (id: number) => {
    try {
      await deleteGameFile(id);
    } catch { /* file may not exist */ }
    setGames(prev => {
      const next = prev.filter(g => g.id !== id);
      persistGames(next);
      return next;
    });
  }, []);

  return { games, loadGamesFromStorage, addGame, updateGame, deleteGame };
}