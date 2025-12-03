import { useState, useCallback, useRef } from 'react';
import { Game } from '@/types';
import { saveGameFile, deleteGameFile } from '@/lib/storage';
import { getSystemNameByCore } from '@/lib/constants';

const STORAGE_KEY = 'games';
const MIGRATION_KEY = 'games_migrated_v1';

async function migrateLegacyGames(games: Game[]) {
  const alreadyMigrated = localStorage.getItem(MIGRATION_KEY) === 'true';
  if (alreadyMigrated) return;

  for (const game of games) {
    if (game.fileData) {
      try {
        const response = await fetch(game.fileData);
        const blob = await response.blob();
        const file = new File([blob], game.fileName || game.title, { type: 'application/octet-stream' });
        await saveGameFile(game.id, file);
      } catch (error) {
        console.error('migration failed for:', game.title, error);
      }
    }
  }
  localStorage.setItem(MIGRATION_KEY, 'true');
}

function cleanGameData(games: Game[]): Game[] {
  return games.map(game => {
    const gameWithoutData = { ...game };
    delete gameWithoutData.fileData;

    if (game.genre === 'ROM' && game.core) {
      gameWithoutData.genre = getSystemNameByCore(game.core);
    }
    if (game.coverArt && !game.coverArtFit) {
      gameWithoutData.coverArtFit = 'cover';
    }
    return gameWithoutData;
  });
}

export function useGameLibrary() {
  const [games, setGames] = useState<Game[]>([]);
  const migrationCheckedRef = useRef(false);

  // migrate old storage format
  const loadGamesFromStorage = useCallback(async () => {
    if (migrationCheckedRef.current) return;
    migrationCheckedRef.current = true;

    try {
      const savedGames = localStorage.getItem(STORAGE_KEY);
      if (!savedGames) return;

      let loadedGames: Game[] = JSON.parse(savedGames);
      const alreadyMigrated = localStorage.getItem(MIGRATION_KEY) === 'true';

      // convert old base64 to opfs
      await migrateLegacyGames(loadedGames);

      // clean legacy data
      loadedGames = cleanGameData(loadedGames);

      setGames(loadedGames);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(loadedGames));

    } catch (error) {
      console.error('load failed', error);
      setGames([]);
    }
  }, []);

  // add new game
  const addGame = useCallback((newGame: Game) => {
    setGames(prev => {
      const updated = [...prev, newGame];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateGame = useCallback((gameId: number, updates: Partial<Game>) => {
    setGames(prev => {
      const updated = prev.map(g => g.id === gameId ? { ...g, ...updates } : g);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteGame = useCallback(async (gameId: number) => {
    try {
      await deleteGameFile(gameId);
      setGames(prev => {
        const updated = prev.filter(g => g.id !== gameId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error('delete failed:', error);
    }
  }, []);

  return {
    games,
    loadGamesFromStorage,
    addGame,
    updateGame,
    deleteGame,
  };
}