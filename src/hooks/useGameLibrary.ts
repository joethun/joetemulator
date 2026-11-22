import { useState, useEffect } from 'react';
import { Game } from '@/types';
import { deleteGameFile, getGameFile, migrateLegacyRoms } from '@/lib/rom-storage';
import { calculateAutoCoverArt, COVER_BASE_URL } from '@/lib/files';
import { deleteAllStates } from '@/lib/savestates';
import { deleteSaveFiles } from '@/lib/ra/fs';
import { deleteCustomCover, isCustomCoverRef, migrateDataUrlCover } from '@/lib/cover-storage';
import { getSystemNameByCore } from '@/lib/constants';
import { gameSaveName } from '@/lib/utils';
import { loadJSON, saveJSON } from '@/lib/local-storage';

const GAMES_KEY = 'games';

const logFailure = (what: string, p: Promise<unknown>) =>
    p.catch(e => console.error(`Failed to delete ${what}:`, e));

const persist = (games: Game[]) => {
    try { localStorage.setItem(GAMES_KEY, JSON.stringify(games)); }
    catch (e) { console.error('Failed to persist games:', e); }
};

// why: next/image throws (crashing the page) on hosts missing from next.config's remotePatterns,
// so drop saved remote cover URLs that aren't on the mirror; refreshAutoCovers re-derives them.
const dropOffMirrorCover = (url: string | undefined) =>
    url && /^https?:/.test(url) && !url.startsWith(COVER_BASE_URL) ? undefined : url;

const COVER_RECOVERY_KEY = 'coverRecoveryVersion';
const COVER_RECOVERY_VERSION = 1;

/**
 * One-time pass: re-derive auto covers that are missing (cover load failures used to erase
 * them) or don't point at the GitHub thumbnail mirror. User-uploaded covers are kept.
 */
async function refreshAutoCovers(games: Game[], update: (id: number, updates: Partial<Game>) => void) {
    if (loadJSON(COVER_RECOVERY_KEY, 0) >= COVER_RECOVERY_VERSION || !navigator.onLine) return;
    for (const g of games) {
        if (!g.core || g.autoCoverArt?.startsWith(COVER_BASE_URL)) continue;
        const rom = await getGameFile(g.id).catch(() => null);
        const cover = rom && await calculateAutoCoverArt(rom, g.fileName || rom.name, g.core);
        if (!cover) continue;
        const hasCustomCover = !!g.coverArt && g.coverArt !== g.autoCoverArt;
        update(g.id, hasCustomCover
            ? { autoCoverArt: cover }
            : { coverArt: cover, autoCoverArt: cover, coverArtFit: g.coverArtFit || 'cover' });
    }
    saveJSON(COVER_RECOVERY_KEY, COVER_RECOVERY_VERSION);
}

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
                    coverArt: dropOffMirrorCover(await migrateDataUrlCover(g.id, g.coverArt)),
                    autoCoverArt: dropOffMirrorCover(g.autoCoverArt),
                    fileData: undefined,
                    filePath: undefined,
                    fileName: g.fileName || g.filePath,
                    genre: g.genre === 'ROM' && g.core ? getSystemNameByCore(g.core) : g.genre,
                    coverArtFit: g.coverArt && !g.coverArtFit ? 'cover' as const : g.coverArtFit,
                    coverLoading: undefined,
                })));
                setGames(cleaned);
                persist(cleaned);
                await refreshAutoCovers(cleaned, (id, updates) =>
                    setGames(prev => { const next = prev.map(x => x.id === id ? { ...x, ...updates } : x); persist(next); return next; }));
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
