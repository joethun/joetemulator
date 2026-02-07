// shared utility functions

/**
 * promise-based delay utility
 */
export const delay = (ms: number): Promise<void> =>
    new Promise(resolve => setTimeout(resolve, ms));

/**
 * clamp a number between min and max bounds
 */
export const clamp = (value: number, min: number, max: number): number =>
    Math.min(Math.max(value, min), max);

/**
 * animation delay constant for card transitions
 */
export const ANIM_DELAY = 350;

/**
 * throttle progress updates to avoid excessive re-renders
 */
export const PROGRESS_THROTTLE_MS = 100;

/**
 * localStorage keys
 */
export const STORAGE_KEYS = {
    GAMES: 'games',
    GAMES_MIGRATED: 'games_migrated_v1',
} as const;
