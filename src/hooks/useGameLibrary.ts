import { useState, useCallback, useRef } from 'react';
import { Game } from '@/types';
import { saveGameFile, deleteGameFile } from '@/lib/storage';
import { getSystemNameByCore } from '@/lib/constants';

const STORAGE_KEY = 'games';
const MIGRATION_KEY = 'games_migrated_v1';

export function useGameLibrary() {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoadingGames, setIsLoadingGames] = useState(true);
  const previousGameCountRef = useRef(0);
  const migrationRef = useRef(false);

  const saveGamesToStorage = useCallback((updatedGames: Game[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedGames));
    setGames(updatedGames);
  }, []);

  const loadGamesFromStorage = useCallback(async () => {
    if (migrationRef.current) return;
    migrationRef.current = true;
    
    setIsLoadingGames(true);
    try {
      const savedGames = localStorage.getItem(STORAGE_KEY);
      if (!savedGames) {
        setIsLoadingGames(false);
        return;
      }

      let loadedGames: Game[] = JSON.parse(savedGames);
      const alreadyMigrated = localStorage.getItem(MIGRATION_KEY) === 'true';

      // Migrate old games with fileData to IndexedDB (only if not already done)
      if (!alreadyMigrated) {
        for (const game of loadedGames) {
          if (game.fileData) {
            try {
              const response = await fetch(game.fileData);
              const blob = await response.blob();
              const file = new File([blob], game.fileName || game.title, { type: 'application/octet-stream' });
              await saveGameFile(game.id, file);
            } catch (error) {
              console.error('Error migrating game to IndexedDB:', error);
            }
          }
        }
        localStorage.setItem(MIGRATION_KEY, 'true');
      }

      // Remove fileData and update genre
      loadedGames = loadedGames.map(game => {
        const { fileData, ...gameWithoutData } = game;
        if (game.genre === 'ROM' && game.core) {
          gameWithoutData.genre = getSystemNameByCore(game.core);
        }
        if (game.coverArt && !game.coverArtFit) {
          gameWithoutData.coverArtFit = 'cover';
        }
        return gameWithoutData;
      });

      localStorage.setItem(STORAGE_KEY, JSON.stringify(loadedGames));
      setGames(loadedGames);
      previousGameCountRef.current = loadedGames.length;
    } catch (error) {
      console.error('Failed to load games from storage', error);
    } finally {
      setIsLoadingGames(false);
    }
  }, []);

  const addGame = useCallback((newGame: Game) => {
    setGames(prev => {
      const updated = [...prev, newGame];
      saveGamesToStorage(updated);
      return updated;
    });
  }, [saveGamesToStorage]);

  const updateGame = useCallback((gameId: number, updates: Partial<Game>) => {
    setGames(prev => {
      const updated = prev.map(g => g.id === gameId ? { ...g, ...updates } : g);
      saveGamesToStorage(updated);
      return updated;
    });
  }, [saveGamesToStorage]);

  const deleteGame = useCallback(async (gameId: number) => {
    try {
      await deleteGameFile(gameId);
      setGames(prev => {
        const updated = prev.filter(g => g.id !== gameId);
        saveGamesToStorage(updated);
        return updated;
      });
    } catch (error) {
      console.error('Error deleting game:', error);
    }
  }, [saveGamesToStorage]);

  const deleteBatch = useCallback(async (gameIds: Set<number>) => {
    try {
      for (const gameId of gameIds) {
        await deleteGameFile(gameId);
      }
      setGames(prev => {
        const updated = prev.filter(g => !gameIds.has(g.id));
        saveGamesToStorage(updated);
        return updated;
      });
    } catch (error) {
      console.error('Error deleting games:', error);
    }
  }, [saveGamesToStorage]);

  return {
    games,
    isLoadingGames,
    previousGameCountRef,
    loadGamesFromStorage,
    saveGamesToStorage,
    addGame,
    updateGame,
    deleteGame,
    deleteBatch,
  };
}
