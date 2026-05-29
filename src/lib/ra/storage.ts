// Shared localStorage JSON helpers used by every ra/* persistence module.

const hasStorage = typeof window !== 'undefined';

export function loadJSON<T>(key: string, fallback: T): T {
    if (!hasStorage) return fallback;
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return fallback;
        const parsed = JSON.parse(raw);
        return (parsed ?? fallback) as T;
    } catch { return fallback; }
}

export function saveJSON(key: string, value: unknown): void {
    if (!hasStorage) return;
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch { /* storage full / disabled */ }
}

export function removeKey(key: string): void {
    if (!hasStorage) return;
    try { localStorage.removeItem(key); }
    catch { /* storage disabled */ }
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
