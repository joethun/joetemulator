import { blobToDataUrl, dataUrlToBytes } from '@/lib/utils';
import { looksLikeZip, loadJSZip } from '@/lib/files';

const STATE_TS_PREFIX = 'ejs_state_ts_';
const STATE_COVER_ASPECT_PREFIX = 'ejs_state_cover_aspect_';
const SLOT_PREFIX = 'ejs_slots_';
const THUMB_SUFFIX = ':thumb';

export const SAVE_STATE_THUMBNAIL_EVENT = 'savestate_thumbnail';

export interface SaveStateThumbnailDetail {
    gameName: string;
    key: string;
    phase: 'pending' | 'ready';
    thumbnail?: string | null;
    coverAspect?: number | null;
}

export function parseSaveStateThumbnailEvent(
    e: Event,
    gameName: string,
): SaveStateThumbnailDetail | null {
    const detail = (e as CustomEvent<SaveStateThumbnailDetail>).detail;
    if (detail?.gameName !== gameName || !detail.key) return null;
    return detail;
}

const MAX_SLOTS = 10;
/** Stored covers are normalized to this width; height scales with the canvas aspect. */
const COVER_TARGET_WIDTH = 512;
const COVER_MAX_WIDTH = 768;
const DB_NAME = 'EmulatorJS-states';
const STORE_NAME = 'states';

export interface SaveState {
    key: string;
    savedAt: Date | null;
    rawData: unknown;
    thumbnail: string | null;
    /** Width / height of the cover image, for placeholders before a thumb exists. */
    coverAspect: number | null;
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

function idbGetMany(db: IDBDatabase, keys: string[]): Promise<Map<string, unknown>> {
    if (!keys.length) return Promise.resolve(new Map());
    return new Promise(resolve => {
        const store = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME);
        const map = new Map<string, unknown>();
        let pending = keys.length;
        const done = () => { if (--pending === 0) resolve(map); };
        for (const key of keys) {
            const req = store.get(key);
            req.onsuccess = () => {
                if (req.result !== undefined) map.set(key, req.result);
                done();
            };
            req.onerror = done;
        }
    });
}

function idbDeleteMany(db: IDBDatabase, keys: string[]): Promise<void> {
    if (!keys.length) return Promise.resolve();
    return new Promise(resolve => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        for (const key of keys) store.delete(key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
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

export const getStateBytes = (key: string): Promise<Uint8Array | null> =>
    withDB(async db => {
        const raw = await idbGet<unknown>(db, key);
        return raw == null ? null : toBytes(raw);
    }, null);

export const putStateBytes = (key: string, bytes: Uint8Array): Promise<void> =>
    withDB(async db => { await idbPut(db, key, bytes); }, undefined);

export const putStateThumbnail = (key: string, dataUrl: string, aspect: number): Promise<void> => {
    stampCoverAspect(key, aspect);
    return withDB(async db => { await idbPut(db, key + THUMB_SUFFIX, dataUrl); }, undefined);
};

/** Placeholder aspect when no cover exists yet for a slot. */
export const DEFAULT_COVER_ASPECT = 4 / 3;

export function stampCoverAspect(key: string, aspect: number): void {
    if (!(aspect > 0)) return;
    try { localStorage.setItem(STATE_COVER_ASPECT_PREFIX + key, String(aspect)); } catch { /* noop */ }
}

function getCoverAspect(key: string): number | null {
    try {
        const raw = localStorage.getItem(STATE_COVER_ASPECT_PREFIX + key);
        if (!raw) return null;
        const n = parseFloat(raw);
        return n > 0 ? n : null;
    } catch { return null; }
}

function clearCoverAspect(key: string): void {
    try { localStorage.removeItem(STATE_COVER_ASPECT_PREFIX + key); } catch { /* noop */ }
}

function dispatchThumbnail(detail: SaveStateThumbnailDetail): void {
    window.dispatchEvent(new CustomEvent(SAVE_STATE_THUMBNAIL_EVENT, { detail }));
}

/**
 * Snapshot the GL canvas synchronously. Must run while the canvas is still
 * alive; the returned offscreen canvas survives the core being destroyed.
 */
export function snapshotCover(
    source: HTMLCanvasElement,
    aspect: number,
): HTMLCanvasElement | null {
    const srcW = source.width;
    const srcH = source.height;
    if (!(srcW > 0 && srcH > 0 && aspect > 0)) return null;

    const srcAspect = srcW / srcH;
    let sx = 0;
    let sy = 0;
    let sw = srcW;
    let sh = srcH;
    if (srcAspect > aspect) {
        sw = srcH * aspect;
        sx = (srcW - sw) / 2;
    } else if (srcAspect < aspect) {
        sh = srcW / aspect;
        sy = (srcH - sh) / 2;
    }

    const w = Math.min(COVER_MAX_WIDTH, Math.max(COVER_TARGET_WIDTH, Math.round(sw)));
    const h = Math.max(1, Math.round(w / aspect));

    try {
        const out = document.createElement('canvas');
        out.width = w;
        out.height = h;
        const ctx = out.getContext('2d');
        if (!ctx) return null;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(source, sx, sy, sw, sh, 0, 0, w, h);
        return out;
    } catch {
        return null;
    }
}

function canvasToDataUrl(canvas: HTMLCanvasElement): Promise<string | null> {
    return new Promise(resolve => {
        try {
            canvas.toBlob(blob => {
                if (!blob) { resolve(null); return; }
                void blobToDataUrl(blob).then(resolve);
            }, 'image/png');
        } catch {
            resolve(null);
        }
    });
}

/** Run after save I/O finishes and a couple of frames have rendered (avoids hitching). */
function deferThumbnailEncode(task: () => void): void {
    const run = () => requestAnimationFrame(() => requestAnimationFrame(task));
    if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(run, { timeout: 3000 });
    } else {
        setTimeout(run, 0);
    }
}

export function scheduleStateThumbnail(
    key: string,
    gameName: string,
    snapshot: HTMLCanvasElement,
): void {
    const aspect = snapshot.width / snapshot.height;
    dispatchThumbnail({ gameName, key, phase: 'pending' });
    deferThumbnailEncode(() => {
        void canvasToDataUrl(snapshot).then(async dataUrl => {
            if (dataUrl) {
                try { await putStateThumbnail(key, dataUrl, aspect); }
                catch { /* still notify so UI leaves pending state */ }
            }
            dispatchThumbnail({
                gameName, key, phase: 'ready',
                thumbnail: dataUrl,
                coverAspect: dataUrl ? aspect : getCoverAspect(key),
            });
        });
    });
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

export async function deleteAllStates(gameName: string): Promise<void> {
    const keys = getSlotKeys(gameName);
    await withDB(
        db => idbDeleteMany(db, keys.flatMap(key => [key, key + THUMB_SUFFIX])),
        undefined,
    );
    try {
        for (const key of keys) {
            localStorage.removeItem(STATE_TS_PREFIX + key);
            clearCoverAspect(key);
        }
        localStorage.removeItem(SLOT_PREFIX + gameName);
    } catch { /* noop */ }
}

function rowFromStore(key: string, store: Map<string, unknown>): SaveState | null {
    const data = store.get(key);
    if (data === undefined) return null;
    const thumb = store.get(key + THUMB_SUFFIX);
    return {
        key,
        savedAt: getTimestamp(key),
        rawData: data,
        thumbnail: typeof thumb === 'string' ? thumb : null,
        coverAspect: getCoverAspect(key),
    };
}

const fetchStateRows = (gameName: string, withThumbnails: boolean): Promise<SaveState[]> => {
    const keys = getSlotKeys(gameName);
    if (!keys.length) return Promise.resolve([]);
    const idbKeys = withThumbnails
        ? keys.flatMap(key => [key, key + THUMB_SUFFIX])
        : keys;
    return withDB(async db => {
        const store = await idbGetMany(db, idbKeys);
        return keys
            .map(key => rowFromStore(key, store))
            .filter((r): r is SaveState => r !== null)
            .reverse();
    }, []);
};

export const fetchStates = (gameName: string): Promise<SaveState[]> =>
    fetchStateRows(gameName, true);

export async function removeState(key: string, gameName: string): Promise<void> {
    await withDB(db => idbDeleteMany(db, [key, key + THUMB_SUFFIX]), undefined);
    updateManifest(gameName, m => ({ ...m, slots: m.slots.filter(s => s !== key) }));
    try { localStorage.removeItem(STATE_TS_PREFIX + key); } catch { /* noop */ }
    clearCoverAspect(key);
}

const BUNDLE_STATE_ENTRY = 'state.bin';
const BUNDLE_THUMB_ENTRY = 'thumb.png';

async function unpackImportFile(file: File): Promise<{ state: Uint8Array; thumbnail: string | null }> {
    const buf = await file.arrayBuffer();
    const bytes = new Uint8Array(buf);
    if (!looksLikeZip(bytes.subarray(0, 4))) {
        return { state: bytes, thumbnail: null };
    }
    const JSZip = await loadJSZip();
    const zip = await JSZip.loadAsync(buf);
    const stateEntry = zip.file(BUNDLE_STATE_ENTRY);
    if (!stateEntry) throw new Error('invalid bundle: missing state');
    const state = new Uint8Array(await stateEntry.async('arraybuffer'));
    const thumbEntry = zip.file(BUNDLE_THUMB_ENTRY);
    const thumbnail = thumbEntry
        ? await blobToDataUrl(new Blob(
            [await thumbEntry.async('arraybuffer')],
            { type: 'image/png' },
        ))
        : null;
    return { state, thumbnail };
}

export async function importState(gameName: string, file: File): Promise<void> {
    const { state: incoming, thumbnail } = await unpackImportFile(file);
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
    if (thumbnail) {
        const aspect = await measureDataUrlAspect(thumbnail);
        await putStateThumbnail(key, thumbnail, aspect ?? DEFAULT_COVER_ASPECT);
    }
}

function measureDataUrlAspect(dataUrl: string): Promise<number | null> {
    return new Promise(resolve => {
        const img = new Image();
        img.onload = () => {
            resolve(img.naturalWidth > 0 && img.naturalHeight > 0
                ? img.naturalWidth / img.naturalHeight
                : null);
        };
        img.onerror = () => resolve(null);
        img.src = dataUrl;
    });
}

export async function isStateDuplicate(gameName: string, incoming: Uint8Array): Promise<boolean> {
    return isDuplicate(incoming, await fetchStateRows(gameName, false));
}

function triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    Object.assign(document.createElement('a'), { href: url, download: filename }).click();
    URL.revokeObjectURL(url);
}

export async function downloadState(
    gameName: string,
    savedAt: Date | null,
    data: unknown,
    thumbnail: string | null,
): Promise<void> {
    const bytes = toBytes(data);
    if (!bytes) return;
    const datePart = savedAt
        ? savedAt.toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
            .replace(/[/:,]/g, '').replace(/\s+/g, ' ').trim()
        : 'Unknown';
    const baseName = `${gameName} - ${datePart}`;

    const thumbBytes = thumbnail ? dataUrlToBytes(thumbnail) : null;
    if (thumbBytes) {
        const JSZip = await loadJSZip();
        const zip = new JSZip();
        zip.file(BUNDLE_STATE_ENTRY, bytes);
        zip.file(BUNDLE_THUMB_ENTRY, thumbBytes);
        const blob = await zip.generateAsync({ type: 'blob' });
        triggerDownload(blob, `${baseName}.zip`);
    } else {
        triggerDownload(
            new Blob([bytes.buffer as ArrayBuffer], { type: 'application/octet-stream' }),
            `${baseName}.state`,
        );
    }
}

export function fmtTime(d: Date | null): string {
    if (!d) return 'Unknown';
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
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
