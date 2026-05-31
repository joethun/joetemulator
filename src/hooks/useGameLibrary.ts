import { useState, useEffect } from 'react';
import { Game } from '@/types';
import { deleteGameFile, migrateLegacyRoms } from '@/lib/storage';
import { deleteAllStates } from '@/lib/savestates';
import { getSystemNameByCore } from '@/lib/constants';
import { gameSaveName } from '@/lib/utils';

const GAMES_KEY = 'games';

const persist = (games: Game[]) => {
    try { localStorage.setItem(GAMES_KEY, JSON.stringify(games)); }
    catch (e) { console.error('Failed to persist games:', e); }
};

export function useGameLibrary() {
    const [games, setGames] = useState<Game[]>([]);

    useEffect(() => {
        (async () => {
            try {
                const raw = localStorage.getItem(GAMES_KEY);
                if (!raw) return;
                const parsed: Array<Game & { fileData?: string; filePath?: string }> = JSON.parse(raw);
                await migrateLegacyRoms(parsed);
                const cleaned: Game[] = parsed.map(g => ({
                    ...g,
                    fileData: undefined,
                    filePath: undefined,
                    fileName: g.fileName || g.filePath,
                    genre: g.genre === 'ROM' && g.core ? getSystemNameByCore(g.core) : g.genre,
                    coverArtFit: g.coverArt && !g.coverArtFit ? 'cover' as const : g.coverArtFit,
                    coverLoading: undefined,
                }));
                setGames(cleaned);
                persist(cleaned);
            } catch (e) { console.error('Failed to load games:', e); }
        })();
    }, []);

    const mutate = (fn: (g: Game[]) => Game[]) =>
        setGames(prev => { const next = fn(prev); persist(next); return next; });

    return {
        games,
        addGame: (game: Game) => mutate(g => [...g, game]),
        updateGame: (id: number, updates: Partial<Game>) =>
            mutate(g => g.map(x => x.id === id ? { ...x, ...updates } : x)),
        deleteGame: async (id: number, fileName?: string, title?: string) => {
            try { await deleteGameFile(id); }
            catch (e) { console.error('Failed to delete game file:', e); }
            const name = gameSaveName({ fileName, title });
            if (name) {
                try { await deleteAllStates(name); }
                catch (e) { console.error('Failed to delete save states:', e); }
            }
            mutate(g => g.filter(x => x.id !== id));
        },
    };
}
