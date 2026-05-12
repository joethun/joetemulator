import { loadJSON, saveJSON } from '@/lib/ra/storage';

const STORAGE_KEY = 'ra_volume_v1';
const PATCH_FLAG = '__joetVolumePatched';

interface Persisted { volume?: number; muted?: boolean }
type Win = Window & {
    webkitAudioContext?: typeof AudioContext;
    AudioContext?: typeof AudioContext;
};

let currentVolume = 0.5;
let muted = false;
const gainNodes = new Set<GainNode>();
const listeners = new Set<() => void>();
let initialized = false;

const applyToNodes = () => {
    const target = muted ? 0 : currentVolume;
    for (const g of gainNodes) g.gain.value = target;
};

const persist = () => saveJSON(STORAGE_KEY, { volume: currentVolume, muted });
const emit = () => { for (const fn of listeners) fn(); };

function patchConstructor(w: Win, key: 'AudioContext' | 'webkitAudioContext'): void {
    const Original = w[key] as (typeof AudioContext & Record<string, unknown>) | undefined;
    if (!Original || Original[PATCH_FLAG]) return;

    const Patched = function (this: AudioContext, ...args: unknown[]) {
        const ctx = new (Original as new (...a: unknown[]) => AudioContext)(...args);
        try {
            const gain = ctx.createGain();
            gain.gain.value = muted ? 0 : currentVolume;
            gain.connect(ctx.destination);
            gainNodes.add(gain);
            Object.defineProperty(ctx, 'destination', { value: gain, configurable: true });
        } catch { /* fallback to unpatched ctx */ }
        return ctx;
    } as unknown as typeof AudioContext & Record<string, unknown>;

    Patched.prototype = Original.prototype;
    Patched[PATCH_FLAG] = true;
    w[key] = Patched;
}

export function ensureAudioPatch(): void {
    if (initialized || typeof window === 'undefined') return;
    initialized = true;

    const stored = loadJSON<Persisted>(STORAGE_KEY, {});
    if (typeof stored.volume === 'number') currentVolume = Math.max(0, Math.min(1, stored.volume));
    if (typeof stored.muted === 'boolean') muted = stored.muted;

    const w = window as Win;
    patchConstructor(w, 'AudioContext');
    patchConstructor(w, 'webkitAudioContext');
}

export const getVolume = (): number => currentVolume;
export const isMuted = (): boolean => muted;

export function setVolume(v: number): void {
    currentVolume = Math.max(0, Math.min(1, v));
    if (currentVolume > 0) muted = false;
    applyToNodes(); persist(); emit();
}

export function setMuted(m: boolean): void {
    muted = m;
    applyToNodes(); persist(); emit();
}

export function subscribe(fn: () => void): () => void {
    listeners.add(fn);
    return () => { listeners.delete(fn); };
}
