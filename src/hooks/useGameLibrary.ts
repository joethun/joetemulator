import { useState, useEffect } from 'react';
import { Game } from '@/types';
import { deleteGameFile, migrateLegacyRoms } from '@/lib/rom-storage';
import { deleteAllStates } from '@/lib/savestates';
import { deleteSaveFiles } from '@/lib/ra/fs';
import { deleteCustomCover, isCustomCoverRef, migrateDataUrlCover } from '@/lib/cover-storage';
import { getSystemNameByCore } from '@/lib/constants';
import { gameSaveName } from '@/lib/utils';
import { loadJSON } from '@/lib/local-storage';

const GAMES_KEY = 'games';

const logFailure = (what: string, p: Promise<unknown>) =>
    p.catch(e => console.error(`Failed to delete ${what}:`, e));

const persist = (games: Game[]) => {
    try { localStorage.setItem(GAMES_KEY, JSON.stringify(games)); }
    catch (e) { console.error('Failed to persist games:', e); }
};

export function useGameLibrary() {
    const [games, setGames] = useState<Game[]>([]);

    useEffect(() => {
        (async () => {
            try {
                const parsed = loadJSON<Array<Game & { fileData?: string; filePath?: string }> | null>(GAMES_KEY, null);
                if (!parsed) return;
                await migrateLegacyRoms(parsed);
                const cleaned: Game[] = await Promise.all(parsed.map(async g => ({
                    ...g,
                    coverArt: await migrateDataUrlCover(g.id, g.coverArt),
                    fileData: undefined,
                    filePath: undefined,
                    fileName: g.fileName || g.filePath,
                    genre: g.genre === 'ROM' && g.core ? getSystemNameByCore(g.core) : g.genre,
                    coverArtFit: g.coverArt && !g.coverArtFit ? 'cover' as const : g.coverArtFit,
                    coverLoading: undefined,
                })));
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
        updateGame: (id: number, updates: Partial<Game>) => {
            // A custom cover's file lives only as long as the record points at it.
            if ('coverArt' in updates && !isCustomCoverRef(updates.coverArt)
                && isCustomCoverRef(games.find(x => x.id === id)?.coverArt)) {
                void logFailure('cover', deleteCustomCover(id));
            }
            mutate(g => g.map(x => x.id === id ? { ...x, ...updates } : x));
        },
        /** Remove a game with everything stored for it: ROM, custom cover,
         *  save states and in-game saves. */
        deleteGame: async (game: Game) => {
            const name = gameSaveName(game);
            await Promise.all([
                logFailure('game file', deleteGameFile(game.id)),
                logFailure('cover', deleteCustomCover(game.id)),
                name && logFailure('save states', deleteAllStates(name)),
                name && logFailure('in-game saves', deleteSaveFiles(name)),
            ]);
            mutate(g => g.filter(x => x.id !== game.id));
        },
    };
}
