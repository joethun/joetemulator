// Safe localStorage facade: every accessor no-ops (or returns its fallback)
// when storage is unavailable (SSR, privacy mode, quota exceeded).

const hasStorage = typeof window !== 'undefined';

export function loadString(key: string): string | null {
    if (!hasStorage) return null;
    try { return localStorage.getItem(key); }
    catch { return null; }
}

export function saveString(key: string, value: string): void {
    if (!hasStorage) return;
    try { localStorage.setItem(key, value); }
    catch { /* storage full / disabled */ }
}

export function removeKey(key: string): void {
    if (!hasStorage) return;
    try { localStorage.removeItem(key); }
    catch { /* storage disabled */ }
}

export function loadJSON<T>(key: string, fallback: T): T {
    const raw = loadString(key);
    if (!raw) return fallback;
    try { return (JSON.parse(raw) ?? fallback) as T; }
    catch { return fallback; }
}

export function saveJSON(key: string, value: unknown): void {
    try { saveString(key, JSON.stringify(value)); }
    catch { /* unserializable value */ }
}

/** Read a `Record<string, string>` from localStorage, discarding non-string values. */
export function loadStringRecord(key: string): Record<string, string> {
    const v = loadJSON<unknown>(key, null);
    if (!isObject(v)) return {};
    const out: Record<string, string> = {};
    for (const [k, val] of Object.entries(v)) {
        if (typeof val === 'string') out[k] = val;
    }
    return out;
}

/** Read one entry from a stored `Record<string, string>`. */
export const getStringRecordEntry = (key: string, sub: string): string | undefined =>
    loadStringRecord(key)[sub];

/** Set one entry in a stored `Record<string, string>`, preserving the rest. */
export function setStringRecordEntry(key: string, sub: string, value: string): void {
    saveJSON(key, { ...loadStringRecord(key), [sub]: value });
}

// ─── Shared guards for parsing untrusted stored JSON ─────────────────────────

export const isObject = (v: unknown): v is Record<string, unknown> =>
    !!v && typeof v === 'object';

export const isPosInt = (v: unknown): v is number =>
    typeof v === 'number' && Number.isInteger(v) && v >= 0;

/**
 * Parse a record whose keys are integers (stored as strings) and whose values
 * pass `valueGuard`. Used for player/port-keyed binding and device maps.
 */
export function parseNumberRecord(
    value: unknown,
    valueGuard: (v: unknown) => v is number,
): Record<number, number> {
    if (!isObject(value)) return {};
    const out: Record<number, number> = {};
    for (const [key, v] of Object.entries(value)) {
        const n = Number(key);
        if (Number.isInteger(n) && valueGuard(v)) out[n] = v;
    }
    return out;
}
