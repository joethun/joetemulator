import { useState, useCallback, useRef } from 'react';
import { Game } from '@/types';
import { deleteGameFile, migrateLegacyRoms } from '@/lib/storage';
import { getSystemNameByCore } from '@/lib/constants';

const GAMES_KEY = 'games';

const persist = (games: Game[]) => {
    try { localStorage.setItem(GAMES_KEY, JSON.stringify(games)); }
    catch (e) { console.error('Failed to persist games:', e); }
};

export function useGameLibrary() {
    const [games, setGames] = useState<Game[]>([]);
    const migrated = useRef(false);

    const mutate = useCallback((fn: (g: Game[]) => Game[]) => {
        setGames(prev => { const next = fn(prev); persist(next); return next; });
    }, []);

    const loadGamesFromStorage = useCallback(async () => {
        if (migrated.current) return;
        migrated.current = true;
        try {
            const raw = localStorage.getItem(GAMES_KEY);
            if (!raw) return;
            const parsed: Game[] = JSON.parse(raw);
            await migrateLegacyRoms(parsed);
            const cleaned = parsed.map(({ fileData, ...rest }) => ({
                ...rest,
                genre: rest.genre === 'ROM' && rest.core ? getSystemNameByCore(rest.core) : rest.genre,
                coverArtFit: rest.coverArt && !rest.coverArtFit ? 'cover' as const : rest.coverArtFit,
            }));
            setGames(cleaned);
            persist(cleaned);
        } catch (e) { console.error('Failed to load games:', e); setGames([]); }
    }, []);

    const addGame = useCallback((game: Game) => mutate(g => [...g, game]), [mutate]);
    const updateGame = useCallback((id: number, updates: Partial<Game>) =>
        mutate(g => g.map(x => x.id === id ? { ...x, ...updates } : x)), [mutate]);
    const deleteGame = useCallback(async (id: number) => {
        try { await deleteGameFile(id); } catch { }
        mutate(g => g.filter(x => x.id !== id));
    }, [mutate]);

    return { games, loadGamesFromStorage, addGame, updateGame, deleteGame };
}
