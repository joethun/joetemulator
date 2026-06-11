import { loadJSON, saveJSON } from '@/lib/local-storage';

const STORAGE_KEY = 'ra_volume_v1';
const PATCH_FLAG = '__joetVolumePatched';

interface Persisted { volume?: number; muted?: boolean }
type AudioCtor = typeof AudioContext;
type Win = Window & { webkitAudioContext?: AudioCtor; AudioContext?: AudioCtor };

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

let currentVolume = 0.5;
let muted = false;
let hydrated = false;
const gainNodes = new Set<GainNode>();
const listeners = new Set<() => void>();

function hydrate(): void {
    if (hydrated || typeof window === 'undefined') return;
    hydrated = true;
    const { volume, muted: m } = loadJSON<Persisted>(STORAGE_KEY, {});
    if (typeof volume === 'number') currentVolume = clamp01(volume);
    if (typeof m === 'boolean') muted = m;
}

function emit(): void {
    const target = muted ? 0 : currentVolume;
    for (const g of gainNodes) g.gain.value = target;
    saveJSON(STORAGE_KEY, { volume: currentVolume, muted });
    for (const fn of listeners) fn();
}

function patchConstructor(w: Win, key: 'AudioContext' | 'webkitAudioContext'): void {
    const Original = w[key] as (AudioCtor & Record<string, unknown>) | undefined;
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
    } as unknown as AudioCtor & Record<string, unknown>;

    Patched.prototype = Original.prototype;
    Patched[PATCH_FLAG] = true;
    w[key] = Patched;
}

export function ensureAudioPatch(): void {
    if (typeof window === 'undefined') return;
    hydrate();
    const w = window as Win;
    patchConstructor(w, 'AudioContext');
    patchConstructor(w, 'webkitAudioContext');
}

export function getVolume(): number { hydrate(); return currentVolume; }
export function isMuted():  boolean { hydrate(); return muted; }

export function setVolume(v: number): void {
    currentVolume = clamp01(v);
    if (currentVolume > 0) muted = false;
    emit();
}

export function setMuted(m: boolean): void {
    muted = m;
    emit();
}

export function subscribe(fn: () => void): () => void {
    listeners.add(fn);
    return () => { listeners.delete(fn); };
}
