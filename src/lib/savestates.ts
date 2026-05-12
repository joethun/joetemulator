const STATE_TS_PREFIX = 'ejs_state_ts_';
const SLOT_PREFIX = 'ejs_slots_';

const MAX_SLOTS = 10;
const DB_NAME = 'EmulatorJS-states';
const STORE_NAME = 'states';

export interface SaveState {
    key: string;
    savedAt: Date | null;
    rawData: unknown;
}

interface SlotManifest { slots: string[]; nextIndex: number; }

const EMPTY_MANIFEST: SlotManifest = { slots: [], nextIndex: 0 };

function getManifest(name: string): SlotManifest {
    try { const r = localStorage.getItem(SLOT_PREFIX + name); if (r) return JSON.parse(r); } catch { /* noop */ }
    return EMPTY_MANIFEST;
}

function saveManifest(name: string, m: SlotManifest): void {
    try { localStorage.setItem(SLOT_PREFIX + name, JSON.stringify(m)); } catch { /* noop */ }
}

function updateManifest(name: string, fn: (m: SlotManifest) => SlotManifest): void {
    saveManifest(name, fn(getManifest(name)));
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

async function withDB<T>(fn: (db: IDBDatabase) => Promise<T>, fallback: T): Promise<T> {
    const db = await openDB();
    if (!db) return fallback;
    try { return await fn(db); }
    finally { db.close(); }
}

function idbReq<T>(req: IDBRequest<T>): Promise<T | undefined> {
    return new Promise(resolve => {
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(undefined);
    });
}

const idbGet = <T>(db: IDBDatabase, key: string) =>
    idbReq<T>(db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(key) as IDBRequest<T>);

const idbPut = (db: IDBDatabase, key: string, value: unknown) =>
    idbReq(db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).put(value, key));

const idbDelete = (db: IDBDatabase, key: string) =>
    idbReq(db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).delete(key));

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

export const getStateBytes = (key: string): Promise<Uint8Array | null> =>
    withDB(async db => {
        const raw = await idbGet<unknown>(db, key);
        return raw == null ? null : toBytes(raw);
    }, null);

export const putStateBytes = (key: string, bytes: Uint8Array): Promise<void> =>
    withDB(async db => { await idbPut(db, key, bytes); }, undefined);

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

export async function deleteAllStates(gameName: string): Promise<void> {
    const keys = getSlotKeys(gameName);
    await withDB(async db => {
        for (const key of keys) await idbDelete(db, key);
    }, undefined);
    try {
        for (const key of keys) localStorage.removeItem(STATE_TS_PREFIX + key);
        localStorage.removeItem(SLOT_PREFIX + gameName);
    } catch { /* noop */ }
}

export const fetchStates = (gameName: string): Promise<SaveState[]> => {
    const keys = getSlotKeys(gameName);
    if (!keys.length) return Promise.resolve([]);
    return withDB(async db => {
        const states: SaveState[] = [];
        for (const key of keys) {
            const data = await idbGet<unknown>(db, key);
            if (data !== undefined) states.push({ key, savedAt: getTimestamp(key), rawData: data });
        }
        return states.reverse();
    }, []);
};

export async function removeState(key: string, gameName: string): Promise<void> {
    await withDB(async db => { await idbDelete(db, key); }, undefined);
    updateManifest(gameName, m => ({ ...m, slots: m.slots.filter(s => s !== key) }));
    try { localStorage.removeItem(STATE_TS_PREFIX + key); } catch { /* noop */ }
}

export async function importState(gameName: string, file: File): Promise<void> {
    const incoming = new Uint8Array(await file.arrayBuffer());
    const existing = await fetchStates(gameName);
    if (isDuplicate(incoming, existing)) throw new Error('duplicate');

    const key = `${gameName}.state_imported_${Date.now()}`;
    const ok = await withDB(async db => { await idbPut(db, key, incoming); return true; }, false);
    if (!ok) throw new Error('IndexedDB unavailable');

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

const DAY_MS = 86400000;

export function groupByDay(states: SaveState[]): Array<{ label: string; items: SaveState[] }> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const map = new Map<string, SaveState[]>();
    for (const s of states) {
        let label = 'Unknown';
        if (s.savedAt) {
            const day = new Date(s.savedAt.getFullYear(), s.savedAt.getMonth(), s.savedAt.getDate()).getTime();
            label = day === today ? 'Today'
                : day === today - DAY_MS ? 'Yesterday'
                : s.savedAt.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
        }
        const arr = map.get(label) ?? (map.set(label, []).get(label)!);
        arr.push(s);
    }
    return Array.from(map, ([label, items]) => ({ label, items }));
}
