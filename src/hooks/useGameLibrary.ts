import { useState, useCallback, useRef } from 'react';
import { Game } from '@/types';
import { saveGameFile, deleteGameFile } from '@/lib/storage';
import { getSystemNameByCore } from '@/lib/constants';
import { STORAGE_KEYS } from '@/lib/utils';

// persist games array to localStorage
const persistGames = (games: Game[]): void => {
  localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(games));
};

/**
 * manages the game library with localStorage persistence
 */
export function useGameLibrary() {
  const [games, setGames] = useState<Game[]>([]);
  const migrationCheckedRef = useRef(false);

  // load games from storage with legacy migration
  const loadGamesFromStorage = useCallback(async () => {
    if (migrationCheckedRef.current) return;
    migrationCheckedRef.current = true;

    try {
      const savedGames = localStorage.getItem(STORAGE_KEYS.GAMES);
      if (!savedGames) return;

      const parsed: Game[] = JSON.parse(savedGames);

      // migrate legacy base64 to opfs (one-time)
      if (localStorage.getItem(STORAGE_KEYS.GAMES_MIGRATED) !== 'true') {
        const legacyGames = parsed.filter(g => g.fileData);

        for (const game of legacyGames) {
          try {
            const response = await fetch(game.fileData!);
            const blob = await response.blob();
            const file = new File([blob], game.fileName || game.title, {
              type: 'application/octet-stream'
            });
            await saveGameFile(game.id, file);
          } catch {
            // skip failed migrations
          }
        }

        localStorage.setItem(STORAGE_KEYS.GAMES_MIGRATED, 'true');
      }

      // clean and normalize game data
      const cleaned = parsed.map(game => {
        const { fileData, ...rest } = game;
        return {
          ...rest,
          genre: game.genre === 'ROM' && game.core
            ? getSystemNameByCore(game.core)
            : game.genre,
          coverArtFit: game.coverArt && !game.coverArtFit
            ? 'cover' as const
            : game.coverArtFit
        };
      });

      setGames(cleaned);
      persistGames(cleaned);
    } catch {
      setGames([]);
    }
  }, []);

  // add a new game to the library
  const addGame = useCallback((game: Game) => {
    setGames(prev => {
      const next = [...prev, game];
      persistGames(next);
      return next;
    });
  }, []);

  // update an existing game
  const updateGame = useCallback((id: number, updates: Partial<Game>) => {
    setGames(prev => {
      const next = prev.map(g => g.id === id ? { ...g, ...updates } : g);
      persistGames(next);
      return next;
    });
  }, []);

  // delete a game and its file
  const deleteGame = useCallback(async (id: number) => {
    try {
      await deleteGameFile(id);
    } catch {
      // file may not exist
    }

    setGames(prev => {
      const next = prev.filter(g => g.id !== id);
      persistGames(next);
      return next;
    });
  }, []);

  return {
    games,
    loadGamesFromStorage,
    addGame,
    updateGame,
    deleteGame
  };
}