// Shapes of the JSON produced by scripts/rcheevos/rcw.c, plus the rc_client
// enums the UI cares about. Keep in sync with rcw.c and rc_client.h.

export interface RAUser {
    displayName: string;
    username: string;
    token: string;
}

interface RAGameSummary {
    numCoreAchievements: number;
    numUnlockedAchievements: number;
    pointsCore: number;
    pointsUnlocked: number;
}

export interface RAGame {
    id: number;
    title: string;
    hash: string;
    badgeUrl: string | null;
    summary: RAGameSummary;
}

export interface RAAchievement {
    id: number;
    title: string;
    description: string;
    points: number;
    badgeUrl: string | null;
    badgeLockedUrl: string | null;
    measuredProgress: string;
    measuredPercent: number;
    /** RC_CLIENT_ACHIEVEMENT_UNLOCKED_* bit flags; 0 when locked. */
    unlocked: number;
}

export interface RAAchievementBucket {
    label: string;
    bucketType: number;
    subsetId: number;
    achievements: RAAchievement[];
}

/** What the achievements summary card shows (in-game or from the library). */
export interface AchievementsSummary {
    title: string;
    badgeUrl: string | null;
    unlocked: number;
    total: number;
    pointsUnlocked: number;
    pointsTotal: number;
}

export interface RATracker {
    id: number;
    display: string;
}

export interface RAEvent {
    type: number;
    achievement?: RAAchievement;
    leaderboard?: { title: string; trackerValue: string | null };
    tracker?: RATracker;
    scoreboard?: { bestScore: string; newRank: number; numEntries: number };
    serverError?: { message: string | null };
    subset?: { title: string; badgeUrl: string | null };
}

/** RC_CLIENT_EVENT_* */
export const RA_EVENT = {
    ACHIEVEMENT_TRIGGERED: 1,
    LEADERBOARD_STARTED: 2,
    LEADERBOARD_FAILED: 3,
    LEADERBOARD_SUBMITTED: 4,
    CHALLENGE_INDICATOR_SHOW: 5,
    CHALLENGE_INDICATOR_HIDE: 6,
    PROGRESS_INDICATOR_SHOW: 7,
    PROGRESS_INDICATOR_HIDE: 8,
    PROGRESS_INDICATOR_UPDATE: 9,
    LEADERBOARD_TRACKER_SHOW: 10,
    LEADERBOARD_TRACKER_HIDE: 11,
    LEADERBOARD_TRACKER_UPDATE: 12,
    LEADERBOARD_SCOREBOARD: 13,
    RESET: 14,
    GAME_COMPLETED: 15,
    SERVER_ERROR: 16,
    DISCONNECTED: 17,
    RECONNECTED: 18,
    SUBSET_COMPLETED: 19,
} as const;

/** RC_CLIENT_ACHIEVEMENT_BUCKET_* (the ones the lock-state grouping produces) */
export const RA_BUCKET = { LOCKED: 1, UNLOCKED: 2, UNSUPPORTED: 3 } as const;

/** RC_CLIENT_ACHIEVEMENT_CATEGORY_* / RC_CLIENT_ACHIEVEMENT_LIST_GROUPING_* */
export const RA_CATEGORY_CORE = 1;
export const RA_GROUPING_LOCK_STATE = 0;

/**
 * IDs from here up are placeholder "warning" achievements the server injects
 * for clients it doesn't recognize ("Warning: Unknown Emulator", 0 points,
 * pops after 5 seconds). They aren't real: rc_client never submits them and
 * leaves them out of the game summary (RC_CLIENT_ACHIEVEMENT_WARNING_ID).
 */
const RA_WARNING_ACHIEVEMENT_ID = 101000001;
export const isWarningAchievement = (a: { id: number } | undefined): boolean =>
    !!a && a.id >= RA_WARNING_ACHIEVEMENT_ID;

/** A game's page on the RetroAchievements website. */
export const raGamePageUrl = (gameId: number): string => `https://retroachievements.org/game/${gameId}`;

/** rc_error.h codes surfaced to users. */
export const RC_NO_GAME_LOADED = -29;
export const RC_INVALID_CREDENTIALS = -34;
export const RC_EXPIRED_TOKEN = -35;
