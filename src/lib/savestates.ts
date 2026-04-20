export const STATE_TS_PREFIX = 'ejs_state_ts_';
export const SLOT_PREFIX = 'ejs_slots_';
export const NEXT_LOAD_KEY = 'ejs_load_on_next_';

const MAX_SLOTS = 10;
const DB_NAME = 'EmulatorJS-states';
const STORE_NAME = 'states';

export interface SaveState {
    key: string;
    savedAt: Date | null;
    rawData: unknown;
}

interface SlotManifest { slots: string[]; nextIndex: number; }

function getManifest(name: string): SlotManifest {
    try { const r = localStorage.getItem(SLOT_PREFIX + name); if (r) return JSON.parse(r); } catch { /* noop */ }
    return { slots: [], nextIndex: 0 };
}

function saveManifest(name: string, m: SlotManifest) {
    try { localStorage.setItem(SLOT_PREFIX + name, JSON.stringify(m)); } catch { /* noop */ }
}

export const getSlotKeys = (name: string) => getManifest(name).slots;

export function getNextSlotKey(name: string): string {
    const m = getManifest(name);
    const key = `${name}.state${m.nextIndex}`;
    saveManifest(name, {
        slots: [...m.slots.filter(s => s !== key), key].slice(-MAX_SLOTS),
        nextIndex: (m.nextIndex + 1) % MAX_SLOTS,
    });
    return key;
}

export function stampSlot(key: string): void {
    try { localStorage.setItem(STATE_TS_PREFIX + key, new Date().toISOString()); } catch { /* noop */ }
}

function openDB(): Promise<IDBDatabase | null> {
    return new Promise(resolve => {
        if (typeof window === 'undefined' || !window.indexedDB) return resolve(null);
        const req = indexedDB.open(DB_NAME, 1);
        req.onerror = () => resolve(null);
        req.onsuccess = () => resolve(req.result);
        req.onupgradeneeded = () => {
            if (!req.result.objectStoreNames.contains(STORE_NAME))
                req.result.createObjectStore(STORE_NAME);
        };
    });
}

function idbGet<T>(db: IDBDatabase, key: string): Promise<T | undefined> {
    return new Promise(resolve => {
        const req = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(key);
        req.onsuccess = () => resolve(req.result as T);
        req.onerror = () => resolve(undefined);
    });
}

function idbPut(db: IDBDatabase, key: string, value: unknown): Promise<void> {
    return new Promise(resolve => {
        const req = db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).put(value, key);
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
    });
}

function idbDelete(db: IDBDatabase, key: string): Promise<void> {
    return new Promise(resolve => {
        const req = db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).delete(key);
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
    });
}

function toBytes(data: unknown): Uint8Array | null {
    if (data instanceof Uint8Array) return data;
    if (data instanceof ArrayBuffer) return new Uint8Array(data);
    if (data && typeof data === 'object' && 'data' in data) {
        const d = (data as { data: unknown }).data;
        if (d instanceof Uint8Array) return d;
        if (d instanceof ArrayBuffer) return new Uint8Array(d);
    }
    return null;
}

function getTimestamp(key: string): Date | null {
    try {
        const raw = localStorage.getItem(STATE_TS_PREFIX + key);
        if (!raw) return null;
        const d = new Date(raw);
        return isNaN(d.getTime()) ? null : d;
    } catch { return null; }
}

function hashBytes(bytes: Uint8Array): string {
    const step = Math.max(1, Math.floor(bytes.length / 64));
    let h = bytes.length;
    for (let i = 0; i < bytes.length; i += step) h = (h * 31 + bytes[i]) >>> 0;
    return `${bytes.length}:${h}`;
}

function isDuplicate(incoming: Uint8Array, existing: SaveState[]): boolean {
    const hash = hashBytes(incoming);
    return existing.some(s => { const b = toBytes(s.rawData); return b ? hashBytes(b) === hash : false; });
}

function updateManifest(gameName: string, fn: (m: SlotManifest) => SlotManifest): void {
    try {
        const raw = localStorage.getItem(SLOT_PREFIX + gameName);
        const m: SlotManifest = raw ? JSON.parse(raw) : { slots: [], nextIndex: 0 };
        localStorage.setItem(SLOT_PREFIX + gameName, JSON.stringify(fn(m)));
    } catch { /* noop */ }
}

export async function deleteAllStates(gameName: string): Promise<void> {
    const keys = getSlotKeys(gameName);
    const db = await openDB();
    if (db) {
        for (const key of keys) await idbDelete(db, key);
        const tracker = await idbGet<string[]>(db, '?EJS_KEYS!');
        if (tracker) await idbPut(db, '?EJS_KEYS!', tracker.filter(k => !keys.includes(k)));
        db.close();
    }
    try {
        for (const key of keys) {
            localStorage.removeItem(STATE_TS_PREFIX + key);
            localStorage.removeItem(NEXT_LOAD_KEY + key);
        }
        localStorage.removeItem(SLOT_PREFIX + gameName);
    } catch { /* noop */ }
}

export async function fetchStates(gameName: string): Promise<SaveState[]> {
    const keys = getSlotKeys(gameName);
    if (!keys.length) return [];
    const db = await openDB();
    if (!db) return [];
    const states: SaveState[] = [];
    for (const key of keys) {
        const data = await idbGet<unknown>(db, key);
        if (data !== undefined)
            states.push({ key, savedAt: getTimestamp(key), rawData: data });
    }
    db.close();
    return states.reverse();
}

export async function removeState(key: string, gameName: string): Promise<void> {
    const db = await openDB();
    if (!db) return;
    await idbDelete(db, key);
    const tracker = await idbGet<string[]>(db, '?EJS_KEYS!');
    if (tracker) await idbPut(db, '?EJS_KEYS!', tracker.filter(k => k !== key));
    db.close();
    updateManifest(gameName, m => ({ ...m, slots: m.slots.filter(s => s !== key) }));
    try {
        localStorage.removeItem(STATE_TS_PREFIX + key);
        localStorage.removeItem(NEXT_LOAD_KEY + key);
    } catch { /* noop */ }
}

export async function importState(gameName: string, file: File): Promise<void> {
    const db = await openDB();
    if (!db) throw new Error('IndexedDB unavailable');
    const incoming = new Uint8Array(await file.arrayBuffer());
    const existing = await fetchStates(gameName);
    if (isDuplicate(incoming, existing)) throw new Error('duplicate');
    const key = `${gameName}.state_imported_${Date.now()}`;
    await idbPut(db, key, incoming);
    db.close();
    updateManifest(gameName, m => ({
        ...m,
        slots: m.slots.includes(key) ? m.slots : [...m.slots, key].slice(-MAX_SLOTS),
    }));
    try {
        localStorage.setItem(STATE_TS_PREFIX + key, new Date(file.lastModified || Date.now()).toISOString());
    } catch { /* noop */ }
}

export async function isStateDuplicate(gameName: string, incoming: Uint8Array): Promise<boolean> {
    return isDuplicate(incoming, await fetchStates(gameName));
}

export function downloadState(gameName: string, savedAt: Date | null, data: unknown): void {
    const bytes = toBytes(data);
    if (!bytes) return;
    const url = URL.createObjectURL(new Blob([bytes.buffer as ArrayBuffer], { type: 'application/octet-stream' }));
    const datePart = savedAt
        ? savedAt.toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
            .replace(/[/:,]/g, '').replace(/\s+/g, ' ').trim()
        : 'Unknown';
    Object.assign(document.createElement('a'), { href: url, download: `${gameName} - ${datePart}.state` }).click();
    URL.revokeObjectURL(url);
}

export function fmtDate(d: Date | null): string {
    if (!d) return 'Unknown date';
    return d.toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function groupByDay(states: SaveState[]): Array<{ label: string; items: SaveState[] }> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const map = new Map<string, SaveState[]>();
    for (const s of states) {
        let label = 'Unknown';
        if (s.savedAt) {
            const day = new Date(s.savedAt.getFullYear(), s.savedAt.getMonth(), s.savedAt.getDate()).getTime();
            label = day === today ? 'Today'
                : day === today - 86400000 ? 'Yesterday'
                : s.savedAt.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
        }
        if (!map.has(label)) map.set(label, []);
        map.get(label)!.push(s);
    }
    return Array.from(map.entries()).map(([label, items]) => ({ label, items }));
}
