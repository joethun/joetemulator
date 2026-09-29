import { cheevos } from '@/lib/cheevos/client';
import { unpackForHashing } from '@/lib/cheevos/archive';
import { consoleIdFor } from '@/lib/cheevos/consoles';
import { CHEEVOS_MESSAGE, cacheHash, getCachedHash, loadCredentials } from '@/lib/cheevos/store';
import {
    RA_BUCKET, isWarningAchievement,
    type AchievementsSummary, type RAAchievement, type RAAchievementBucket,
} from '@/lib/cheevos/types';
import { bootFiles } from '@/lib/discs';
import { getGameDiscs } from '@/lib/rom-storage';
import type { Game } from '@/types';

// Achievements for a library game without starting a play session: the
// game is identified by hash, then the set and the player's unlocks are
// fetched read-only (r=achievementsets, r=unlocks) — no startsession, so
// nothing is recorded as played on the player's profile.

/** Achievement.FLAG_PROMOTED — published ("core") achievements. */
const FLAG_PROMOTED = 3;

export type LibraryAchievementsResult =
    | { kind: 'ok'; gameId: number; summary: AchievementsSummary; buckets: RAAchievementBucket[] }
    | { kind: 'logged-out' | 'unsupported' | 'unknown-game' | 'no-achievements' | 'error'; message: string };

interface ApiResponse {
    Success?: boolean;
    Code?: string;
    Error?: string;
}

const isLoginError = (r: ApiResponse) =>
    r.Success === false && (r.Code === 'invalid_credentials' || r.Code === 'expired_token' || /token|credential/i.test(r.Error ?? ''));

const LOGIN_EXPIRED = { kind: 'logged-out', message: CHEEVOS_MESSAGE.loginExpired } as const;

interface SetsResponse extends ApiResponse {
    GameId?: number;
    Title?: string;
    ImageIconUrl?: string;
    Sets?: Array<{ GameId?: number; Achievements?: SetAchievement[] }>;
}

interface SetAchievement {
    ID: number;
    Title: string;
    Description: string;
    Points: number;
    BadgeName: string;
    Flags: number;
    BadgeURL?: string;
    BadgeLockedURL?: string;
    Rarity?: number;
    RarityHardcore?: number;
}

async function raRequest<T>(params: Record<string, string>): Promise<T> {
    const res = await cheevos.post('', new URLSearchParams(params).toString());
    const json = await res.json().catch(() => null) as T | null;
    if (!json) throw new Error(`RetroAchievements returned HTTP ${res.status}`);
    return json;
}

/** Hash the game's files the way a play session would (cached per game). */
async function hashGame(game: Game, consoleId: number): Promise<string | null> {
    const fileName = game.fileName ?? '';
    const cached = getCachedHash(game.core!, fileName);
    if (cached) return cached;

    const roms = await getGameDiscs(game.id, game.discNames ?? [fileName]);
    if (!roms.length) throw new Error('The game file is missing.');

    const boot = bootFiles(roms);
    const unpacked = await unpackForHashing(boot.files, boot.path, game.core!);

    cheevos.setFiles(unpacked.files);
    try {
        const hash = await cheevos.generateHash(unpacked.consoleId ?? consoleId, unpacked.bootPath);
        if (hash) cacheHash(game.core!, fileName, hash);
        return hash;
    } finally {
        cheevos.setFiles([]);
    }
}

const badgeUrl = (a: SetAchievement, locked: boolean): string =>
    (locked ? a.BadgeLockedURL : a.BadgeURL)
    ?? `https://media.retroachievements.org/Badge/${a.BadgeName}${locked ? '_lock' : ''}.png`;

function toAchievement(a: SetAchievement, unlocked: boolean): RAAchievement {
    return {
        id: a.ID,
        title: a.Title,
        description: a.Description,
        points: a.Points,
        badgeUrl: badgeUrl(a, false),
        badgeLockedUrl: badgeUrl(a, true),
        measuredProgress: '',
        measuredPercent: 0,
        unlocked: unlocked ? 1 : 0,
        // r=unlocks only lists ids; unlock times come with startsession,
        // which this read-only view avoids.
        unlockTime: 0,
        rarity: a.Rarity ?? null,
        rarityHardcore: a.RarityHardcore ?? null,
    };
}

export async function fetchLibraryAchievements(game: Game, hardcore: boolean): Promise<LibraryAchievementsResult> {
    const creds = loadCredentials();
    if (!creds) return { kind: 'logged-out', message: 'Log in to RetroAchievements from Settings to see achievements.' };

    const consoleId = game.core ? consoleIdFor(game.core, game.fileName ?? '') : null;
    if (consoleId == null) return { kind: 'unsupported', message: CHEEVOS_MESSAGE.unsupportedSystem };

    try {
        const hash = await hashGame(game, consoleId);
        if (!hash) return { kind: 'unsupported', message: "This game's files couldn't be identified for achievements." };

        const auth = { u: creds.username, t: creds.token };
        const sets = await raRequest<SetsResponse>({ r: 'achievementsets', ...auth, m: hash });
        if (isLoginError(sets)) return LOGIN_EXPIRED;
        if (!sets.GameId) return { kind: 'unknown-game', message: CHEEVOS_MESSAGE.unknownGame };

        const achievementsBySet = (sets.Sets ?? []).map(s => ({
            gameId: s.GameId ?? sets.GameId!,
            // Only published achievements; drop the server's unknown-client warning.
            achievements: (s.Achievements ?? []).filter(a => a.Flags === FLAG_PROMOTED && !isWarningAchievement({ id: a.ID })),
        })).filter(s => s.achievements.length);
        const all = achievementsBySet.flatMap(s => s.achievements);
        if (!all.length) return { kind: 'no-achievements', message: CHEEVOS_MESSAGE.noAchievements };

        // Unlocks are per game id (subsets have their own).
        const unlockLists = await Promise.all([...new Set(achievementsBySet.map(s => s.gameId))].map(gameId =>
            raRequest<ApiResponse & { UserUnlocks?: number[] }>({ r: 'unlocks', ...auth, g: String(gameId), h: hardcore ? '1' : '0' })));
        if (unlockLists.some(isLoginError)) return LOGIN_EXPIRED;
        // Without the unlock list every achievement would wrongly show as locked.
        const missing = unlockLists.find(res => !res.UserUnlocks);
        if (missing) throw new Error(missing.Error || 'Could not load your unlocks.');
        const unlockedIds = new Set(unlockLists.flatMap(res => res.UserUnlocks!));

        const unlocked = all.filter(a => unlockedIds.has(a.ID));
        const locked = all.filter(a => !unlockedIds.has(a.ID));
        const buckets: RAAchievementBucket[] = [
            { label: 'Unlocked', bucketType: RA_BUCKET.UNLOCKED, subsetId: 0, achievements: unlocked.map(a => toAchievement(a, true)) },
            { label: 'Locked', bucketType: RA_BUCKET.LOCKED, subsetId: 0, achievements: locked.map(a => toAchievement(a, false)) },
        ].filter(b => b.achievements.length);

        const sum = (list: SetAchievement[]) => list.reduce((n, a) => n + a.Points, 0);
        return {
            kind: 'ok',
            gameId: sets.GameId,
            buckets,
            summary: {
                title: sets.Title ?? game.title,
                badgeUrl: sets.ImageIconUrl ?? null,
                unlocked: unlocked.length,
                total: all.length,
                pointsUnlocked: sum(unlocked),
                pointsTotal: sum(all),
            },
        };
    } catch (e) {
        console.error('library achievements failed:', e);
        return { kind: 'error', message: e instanceof Error ? e.message : 'Could not load achievements.' };
    }
}
