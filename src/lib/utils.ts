export const delay = (ms: number): Promise<void> => new Promise(r => setTimeout(r, ms));

export const ANIM_DELAY = 350;
export const PROGRESS_THROTTLE_MS = 100;

export const STORAGE_KEYS = { GAMES: 'games' } as const;

export const stripExt = (name: string) => name.replace(/\.[^/.]+$/, '');