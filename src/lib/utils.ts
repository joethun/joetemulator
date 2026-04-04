export const delay = (ms: number): Promise<void> => new Promise(r => setTimeout(r, ms));

export const PROGRESS_THROTTLE_MS = 100;

export const stripExt = (name: string) => name.replace(/\.[^/.]+$/, '');