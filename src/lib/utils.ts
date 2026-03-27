export const delay = (ms: number): Promise<void> =>
    new Promise(resolve => setTimeout(resolve, ms));

export const ANIM_DELAY = 350;
export const PROGRESS_THROTTLE_MS = 100;

export const STORAGE_KEYS = {
    GAMES: 'games',
    GAMES_MIGRATED: 'games_migrated_v1',
} as const;
