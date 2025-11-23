import { useState, useCallback, useRef } from 'react';
import { Game } from '@/types';
import { saveGameFile, deleteGameFile } from '@/lib/storage';
import { getSystemNameByCore } from '@/lib/constants';

const STORAGE_KEY = 'games';
const MIGRATION_KEY = 'games_migrated_v1';

export function useGameLibrary() {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoadingGames, setIsLoadingGames] = useState(true);
  const migrationCheckedRef = useRef(false);

  // persists to localstorage
  const saveGamesToStorage = useCallback((updatedGames: Game[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedGames));
      setGames(updatedGames);
    } catch (error) {
      console.error('failed to save games:', error);
    }
  }, []);

  // loads and migrates legacy data
  const loadGamesFromStorage = useCallback(async () => {
    if (migrationCheckedRef.current) return;
    migrationCheckedRef.current = true;
    
    setIsLoadingGames(true);
    try {
      const savedGames = localStorage.getItem(STORAGE_KEY);
      if (!savedGames) {
        setIsLoadingGames(false);
        return;
      }

      let loadedGames: Game[] = JSON.parse(savedGames);
      const alreadyMigrated = localStorage.getItem(MIGRATION_KEY) === 'true';

      // migrate base64 to indexeddb
      if (!alreadyMigrated) {
        console.log('migrating games...');
        for (const game of loadedGames) {
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

      // cleanup game objects
      loadedGames = loadedGames.map(game => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { fileData, ...gameWithoutData } = game;
        
        if (game.genre === 'ROM' && game.core) {
          gameWithoutData.genre = getSystemNameByCore(game.core);
        }
        if (game.coverArt && !game.coverArtFit) {
          gameWithoutData.coverArtFit = 'cover';
        }
        return gameWithoutData;
      });

      setGames(loadedGames);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(loadedGames));
      
    } catch (error) {
      console.error('load failed', error);
      setGames([]);
    } finally {
      setIsLoadingGames(false);
    }
  }, []);

  // crud operations
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
    isLoadingGames,
    loadGamesFromStorage,
    saveGamesToStorage,
    addGame,
    updateGame,
    deleteGame,
  };
}