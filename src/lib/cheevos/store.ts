import { useSyncExternalStore } from 'react';
import {
    getStringRecordEntry, isObject, loadJSON, removeKey, saveJSON, setStringRecordEntry,
} from '@/lib/local-storage';
import type { RAAchievement, RAGame, RATracker, RAUser } from '@/lib/cheevos/types';

// ─── Credentials ─────────────────────────────────────────────────────────────
// Only the username + API token rc_client returns on login are kept, the same
// as RetroArch's cheevos_token. The password is never stored.

const CREDENTIALS_KEY = 'ra_credentials_v1';

export interface RACredentials { username: string; token: string }

export function loadCredentials(): RACredentials | null {
    const v = loadJSON<unknown>(CREDENTIALS_KEY, null);
    if (!isObject(v) || typeof v.username !== 'string' || typeof v.token !== 'string') return null;
    if (!v.username || !v.token) return null;
    return { username: v.username, token: v.token };
}

export const saveCredentials = (c: RACredentials): void => saveJSON(CREDENTIALS_KEY, c);
export const clearCredentials = (): void => removeKey(CREDENTIALS_KEY);

// ─── Game hashes ─────────────────────────────────────────────────────────────
// RA hash per library game (system + file name — the hash depends on both),
// so opening a game's achievements from the library doesn't re-read
// (possibly huge) disc images. Written whenever a hash
// is computed — by a play session or by the library view.

const HASHES_KEY = 'ra_hashes_v1';

export const getCachedHash = (system: string, fileName: string): string | undefined =>
    getStringRecordEntry(HASHES_KEY, `${system}/${fileName}`);

export const cacheHash = (system: string, fileName: string, hash: string): void =>
    setStringRecordEntry(HASHES_KEY, `${system}/${fileName}`, hash);

// ─── Live session state ──────────────────────────────────────────────────────

export type CheevosStatus =
    | 'idle'            // no session
    | 'loading'         // logging in / identifying the game
    | 'active'          // game identified, achievements running
    | 'no-achievements' // game known to RA but has no core achievements
    | 'unknown-game'    // hash not recognised by RA
    | 'unsupported'     // system/format RA or this client can't handle
    | 'error';

/** Explanations shared by play sessions and the library view. */
export const CHEEVOS_MESSAGE = {
    unsupportedSystem: 'RetroAchievements does not support this system.',
    unknownGame: 'This game is not recognized by RetroAchievements.',
    noAchievements: 'RetroAchievements has no achievements for this game.',
    loginExpired: 'Your RetroAchievements login expired. Log in again from Settings.',
    identifying: 'Identifying this game with RetroAchievements.',
} as const;

export type ToastKind = 'achievement' | 'mastery' | 'leaderboard' | 'info' | 'error';

export interface CheevosToast {
    id: number;
    kind: ToastKind;
    title: string;
    description?: string;
    badgeUrl?: string | null;
    points?: number;
    /** Clicking the toast opens this achievement in the Achievements tab. */
    achievementId?: number;
}

export interface CheevosState {
    user: RAUser | null;
    status: CheevosStatus;
    message: string | null;
    game: RAGame | null;
    /** Hardcore is on for the running session. */
    hardcore: boolean;
    challenges: RAAchievement[];
    progress: RAAchievement | null;
    trackers: RATracker[];
    toasts: CheevosToast[];
    /** Bumped whenever the achievement list may have changed (unlocks). */
    listVersion: number;
}

const INITIAL: CheevosState = {
    user: null, status: 'idle', message: null, game: null, hardcore: false,
    challenges: [], progress: null, trackers: [], toasts: [], listVersion: 0,
};

let state: CheevosState = INITIAL;
const listeners = new Set<() => void>();
let nextToastId = 1;

export const getCheevosState = (): CheevosState => state;

export function patchCheevosState(patch: Partial<CheevosState> | ((s: CheevosState) => Partial<CheevosState>)): void {
    const p = typeof patch === 'function' ? patch(state) : patch;
    state = { ...state, ...p };
    listeners.forEach(l => l());
}

/** Hardcore restrictions apply: requested and the game has (or may have)
 *  achievements. Held while identifying so a state can't slip in first. */
export const isHardcoreLocked = (s: CheevosState): boolean =>
    s.hardcore && (s.status === 'loading' || s.status === 'active');

/** Clear per-game state, keeping the logged-in user. */
export const resetCheevosSession = (): void =>
    patchCheevosState(s => ({ ...INITIAL, user: s.user }));

const MAX_TOASTS = 4;

export function pushCheevosToast(toast: Omit<CheevosToast, 'id'>): void {
    const id = nextToastId++;
    patchCheevosState(s => ({ toasts: [...s.toasts, { ...toast, id }].slice(-MAX_TOASTS) }));
}

export const pushHardcoreToast = (description: string): void =>
    pushCheevosToast({ kind: 'info', title: 'Hardcore mode', description });

export const dismissCheevosToast = (id: number): void =>
    patchCheevosState(s => ({ toasts: s.toasts.filter(t => t.id !== id) }));

const subscribe = (cb: () => void) => {
    listeners.add(cb);
    return () => { listeners.delete(cb); };
};

export function useCheevos(): CheevosState {
    return useSyncExternalStore(subscribe, getCheevosState, () => INITIAL);
}

/** Subscribe to one derived value, re-rendering only when it changes — the
 *  store also updates on every tracker tick, toast and progress change. */
export function useCheevosSelector<T>(select: (s: CheevosState) => T): T {
    return useSyncExternalStore(subscribe, () => select(state), () => select(INITIAL));
}
