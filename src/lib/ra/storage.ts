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
    if (!v || typeof v !== 'object') return {};
    const out: Record<string, string> = {};
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
        if (typeof val === 'string') out[k] = val;
    }
    return out;
}
