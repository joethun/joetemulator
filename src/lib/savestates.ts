import { loadJSON, saveJSON, loadString, saveString, removeKey } from '@/lib/local-storage';
import { dataUrlToBytes, groupBy, openExistingDB } from '@/lib/utils';
import { opfsDir, readFile, removeFiles, writeFile } from '@/lib/opfs';
import { looksLikeZip } from '@/lib/files';
import { buildZip, openZipEntry, readZipDirectory } from '@/lib/zip';

const STATE_TS_PREFIX = 'ejs_state_ts_';
const STATE_COVER_ASPECT_PREFIX = 'ejs_state_cover_aspect_';
const STATE_HASH_PREFIX = 'ejs_state_hash_';
const SLOT_PREFIX = 'ejs_slots_';

export const SAVE_STATE_THUMBNAIL_EVENT = 'savestate_thumbnail';
export const EMULATOR_NOTIFICATION_EVENT = 'emulator_notification';

/** A save/load that happened, for the transient on-screen icon. `source`
 *  distinguishes user-triggered actions from the autosave/autoload timers, which
 *  the user can silence independently in settings. */
export interface EmulatorNotificationDetail {
    type: 'save' | 'load';
    source: 'manual' | 'auto';
}

export function notifyEmulator(detail: EmulatorNotificationDetail): void {
    window.dispatchEvent(new CustomEvent(EMULATOR_NOTIFICATION_EVENT, { detail }));
}

export const parseEmulatorNotificationEvent = (e: Event): EmulatorNotificationDetail | null =>
    (e as CustomEvent<EmulatorNotificationDetail>).detail ?? null;

interface SaveStateThumbnailDetail {
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

// State bytes, thumbnails and achievement progress are files in OPFS, one set
// per slot key. The per-slot metadata (slot manifest, timestamp, hash, cover
// aspect) stays in localStorage: it's tiny, and the autosave duplicate check
// reads it every tick without touching the state files.
const STATES_DIR = 'states';
const STATE_EXT = '.state';
const THUMB_EXT = '.thumb.png';
/** RetroAchievements progress captured with a state (rc_client_serialize_progress). */
const CHEEVOS_EXT = '.rc';
const SLOT_EXTS = [STATE_EXT, THUMB_EXT, CHEEVOS_EXT];

/** IndexedDB store that held states before OPFS; read once to migrate. */
const LEGACY_DB_NAME = 'EmulatorJS-states';
const LEGACY_STORE_NAME = 'states';
const LEGACY_THUMB_SUFFIX = ':thumb';
const LEGACY_CHEEVOS_SUFFIX = ':rc';

export interface SaveState {
    key: string;
    savedAt: Date | null;
    /** Object URL of the cover thumbnail. */
    thumbnail: string | null;
    /** Width / height of the cover image, for placeholders before a thumb exists. */
    coverAspect: number | null;
}

interface SlotManifest { slots: string[]; nextIndex: number; }

const EMPTY_MANIFEST: SlotManifest = { slots: [], nextIndex: 0 };

const getManifest = (name: string): SlotManifest =>
    loadJSON(SLOT_PREFIX + name, EMPTY_MANIFEST);

const saveManifest = (name: string, m: SlotManifest): void =>
    saveJSON(SLOT_PREFIX + name, m);

/**
 * Persist a new manifest and delete the data (state files, localStorage meta) of
 * every slot that fell out of it — otherwise evicted slots would orphan their
 * files forever. All slot-list mutations must go through here.
 */
async function commitManifest(name: string, next: SlotManifest): Promise<void> {
    const prev = getManifest(name);
    saveManifest(name, next);
    const kept = new Set(next.slots);
    const evicted = prev.slots.filter(k => !kept.has(k));
    if (!evicted.length) return;
    for (const key of evicted) {
        clearSlotMeta(key);
        forgetThumbnail(key);
    }
    try { await removeFiles(await getDir(), evicted.flatMap(key => SLOT_EXTS.map(ext => slotFile(key, ext)))); }
    catch (e) { console.error('failed to delete evicted states:', e); }
}

export const getSlotKeys = (name: string) => getManifest(name).slots;

/** Slot list with `key` moved/added to the newest position, capped at MAX_SLOTS. */
const withSlot = (m: SlotManifest, key: string): string[] =>
    [...m.slots.filter(s => s !== key), key].slice(-MAX_SLOTS);

export function getNextSlotKey(name: string): string {
    const m = getManifest(name);
    const key = `${name}.state${m.nextIndex}`;
    void commitManifest(name, {
        slots: withSlot(m, key),
        nextIndex: (m.nextIndex + 1) % MAX_SLOTS,
    });
    return key;
}

export function stampSlot(key: string, at = new Date()): void {
    saveString(STATE_TS_PREFIX + key, at.toISOString());
}

// ─── OPFS files ──────────────────────────────────────────────────────────────

// Keys come from ROM file names; encoding keeps any character OPFS rejects
// (path separators) out of the file name.
const slotFile = (key: string, ext: string) => encodeURIComponent(key) + ext;

let dirPromise: Promise<FileSystemDirectoryHandle> | null = null;

/** The states directory, after any pending IndexedDB migration has run. */
function getDir(): Promise<FileSystemDirectoryHandle> {
    dirPromise ??= opfsDir(STATES_DIR)
        .then(async dir => { await migrateFromIndexedDB(dir); return dir; })
        .catch(e => { dirPromise = null; throw e; });
    return dirPromise;
}

const readSlotFile = async (key: string, ext: string) => readFile(await getDir(), slotFile(key, ext));

async function readSlotBytes(key: string, ext: string): Promise<Uint8Array | null> {
    const file = await readSlotFile(key, ext);
    return file ? new Uint8Array(await file.arrayBuffer()) : null;
}

// ─── IndexedDB migration ─────────────────────────────────────────────────────

function idbReq<T>(req: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
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

/** OPFS file name and contents for a legacy IndexedDB entry, or null if unusable. */
function legacyEntryToFile(key: string, value: unknown): { name: string; data: Blob | Uint8Array } | null {
    if (key.endsWith(LEGACY_THUMB_SUFFIX)) {
        // Thumbnails were PNG data URLs.
        const bytes = typeof value === 'string' ? dataUrlToBytes(value) : null;
        if (!bytes) return null;
        return {
            name: slotFile(key.slice(0, -LEGACY_THUMB_SUFFIX.length), THUMB_EXT),
            data: new Blob([bytes as Uint8Array<ArrayBuffer>], { type: 'image/png' }),
        };
    }
    const bytes = toBytes(value);
    if (!bytes) return null;
    return key.endsWith(LEGACY_CHEEVOS_SUFFIX)
        ? { name: slotFile(key.slice(0, -LEGACY_CHEEVOS_SUFFIX.length), CHEEVOS_EXT), data: bytes }
        : { name: slotFile(key, STATE_EXT), data: bytes };
}

/**
 * Move states saved before OPFS out of IndexedDB. Each entry is deleted as soon
 * as its copy lands, so the two stores never both hold a large state; whatever
 * fails stays put and is retried on the next page load.
 */
async function migrateFromIndexedDB(dir: FileSystemDirectoryHandle): Promise<void> {
    const db = await openExistingDB(LEGACY_DB_NAME).catch(() => null);
    if (!db) return;
    let failed = false;
    try {
        if (db.objectStoreNames.contains(LEGACY_STORE_NAME)) {
            const store = () => db.transaction(LEGACY_STORE_NAME, 'readwrite').objectStore(LEGACY_STORE_NAME);
            const keys = await idbReq(store().getAllKeys());
            for (const key of keys) {
                try {
                    // One entry in memory at a time; the OPFS write ends the
                    // transaction, so each step opens its own.
                    const file = legacyEntryToFile(String(key), await idbReq(store().get(key)));
                    if (file) await writeFile(dir, file.name, file.data);
                    await idbReq(store().delete(key));
                } catch (e) {
                    failed = true;
                    console.error('save state migration failed:', key, e);
                }
            }
        }
    } catch (e) {
        failed = true;
        console.error('save state migration failed:', e);
    } finally {
        db.close();
    }
    if (!failed) indexedDB.deleteDatabase(LEGACY_DB_NAME);
}

// ─── State data ──────────────────────────────────────────────────────────────

export async function getStateBytes(key: string): Promise<Uint8Array | null> {
    try { return await readSlotBytes(key, STATE_EXT); }
    catch (e) { console.error('read state failed:', e); return null; }
}

/** Store a state's bytes. Resolves false if the write didn't land. */
export async function putStateBytes(key: string, bytes: Uint8Array): Promise<boolean> {
    try { await writeFile(await getDir(), slotFile(key, STATE_EXT), bytes); }
    catch (e) { console.error('write state failed:', e); return false; }
    // Fingerprint only a state that actually landed: a hash left behind by a
    // failed write would make the next identical autosave look like a
    // duplicate and get silently skipped.
    stampHash(key, bytes);
    return true;
}

export async function getStateCheevosProgress(key: string): Promise<Uint8Array | null> {
    try { return await readSlotBytes(key, CHEEVOS_EXT); }
    catch (e) { console.error('read achievement progress failed:', e); return null; }
}

/** Store (or, with null, clear) the achievement progress for a slot. Always
 *  written alongside the state so a reused slot never keeps stale progress. */
export async function putStateCheevosProgress(key: string, progress: Uint8Array | null): Promise<void> {
    try {
        if (progress) await writeFile(await getDir(), slotFile(key, CHEEVOS_EXT), progress);
        else await removeFiles(await getDir(), [slotFile(key, CHEEVOS_EXT)]);
    } catch (e) {
        console.error('write achievement progress failed:', e);
    }
}

// ─── Thumbnails ──────────────────────────────────────────────────────────────

// Object URLs by slot key. A thumbnail written this session points at its
// in-memory blob, so overwriting the file never invalidates a URL still shown.
const thumbUrls = new Map<string, string>();

function forgetThumbnail(key: string): void {
    const url = thumbUrls.get(key);
    if (url) URL.revokeObjectURL(url);
    thumbUrls.delete(key);
}

async function getThumbnailUrl(key: string): Promise<string | null> {
    const cached = thumbUrls.get(key);
    if (cached) return cached;
    const file = await readSlotFile(key, THUMB_EXT);
    if (!file) return null;
    const url = URL.createObjectURL(file);
    thumbUrls.set(key, url);
    return url;
}

/** Store a slot's thumbnail and return its object URL. */
async function putStateThumbnail(key: string, png: Blob, aspect: number): Promise<string> {
    stampCoverAspect(key, aspect);
    await writeFile(await getDir(), slotFile(key, THUMB_EXT), png);
    forgetThumbnail(key);
    const url = URL.createObjectURL(png);
    thumbUrls.set(key, url);
    return url;
}

/** Placeholder aspect when no cover exists yet for a slot. */
export const DEFAULT_COVER_ASPECT = 4 / 3;

export function stampCoverAspect(key: string, aspect: number): void {
    if (!(aspect > 0)) return;
    saveString(STATE_COVER_ASPECT_PREFIX + key, String(aspect));
}

function getCoverAspect(key: string): number | null {
    const n = parseFloat(loadString(STATE_COVER_ASPECT_PREFIX + key) ?? '');
    return n > 0 ? n : null;
}

/** Drop the per-slot localStorage metadata (timestamp, cover aspect, content hash). */
function clearSlotMeta(key: string): void {
    removeKey(STATE_TS_PREFIX + key);
    removeKey(STATE_COVER_ASPECT_PREFIX + key);
    removeKey(STATE_HASH_PREFIX + key);
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

function canvasToPng(canvas: HTMLCanvasElement): Promise<Blob | null> {
    return new Promise(resolve => {
        try { canvas.toBlob(resolve, 'image/png'); }
        catch { resolve(null); }
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

async function encodeAndPersistThumbnail(
    key: string,
    gameName: string,
    snapshot: HTMLCanvasElement,
): Promise<void> {
    const aspect = snapshot.width / snapshot.height;
    const png = await canvasToPng(snapshot);
    let url: string | null = null;
    if (png) {
        try { url = await putStateThumbnail(key, png, aspect); }
        catch { /* still notify so UI leaves pending state */ }
    }
    dispatchThumbnail({
        gameName, key, phase: 'ready',
        thumbnail: url,
        coverAspect: url ? aspect : getCoverAspect(key),
    });
}

export function scheduleStateThumbnail(
    key: string,
    gameName: string,
    snapshot: HTMLCanvasElement,
): void {
    dispatchThumbnail({ gameName, key, phase: 'pending' });
    deferThumbnailEncode(() => { void encodeAndPersistThumbnail(key, gameName, snapshot); });
}

/** Synchronous variant used on exit, where the page is about to reload — the
 * deferred RAF/idle callback wouldn't fire in time, so we await the encode. */
export async function persistStateThumbnailNow(
    key: string,
    gameName: string,
    snapshot: HTMLCanvasElement,
): Promise<void> {
    dispatchThumbnail({ gameName, key, phase: 'pending' });
    await encodeAndPersistThumbnail(key, gameName, snapshot);
}

function getTimestamp(key: string): Date | null {
    const raw = loadString(STATE_TS_PREFIX + key);
    if (!raw) return null;
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
}

/** Cheap content fingerprint: length plus 64 evenly-spaced samples. */
function hashBytes(bytes: Uint8Array): string {
    const step = Math.max(1, Math.floor(bytes.length / 64));
    let h = bytes.length;
    for (let i = 0; i < bytes.length; i += step) h = (h * 31 + bytes[i]) >>> 0;
    return `${bytes.length}:${h}`;
}

const stampHash = (key: string, bytes: Uint8Array): void =>
    saveString(STATE_HASH_PREFIX + key, hashBytes(bytes));

/**
 * Fingerprints of every stored slot. Hashes are recorded in localStorage when a
 * state is written, so the common case reads no state files at all — important
 * because the autosave timer calls this on every tick and states run to tens of
 * megabytes. Slots written before hashes were persisted are read once here and
 * backfilled.
 */
async function slotHashes(gameName: string): Promise<Set<string>> {
    const hashes = new Set<string>();
    const missing: string[] = [];
    for (const key of getSlotKeys(gameName)) {
        const stored = loadString(STATE_HASH_PREFIX + key);
        if (stored) hashes.add(stored);
        else missing.push(key);
    }
    if (!missing.length) return hashes;

    for (const key of missing) {
        const bytes = await getStateBytes(key);
        if (!bytes) continue;
        stampHash(key, bytes);
        hashes.add(hashBytes(bytes));
    }
    return hashes;
}

export const isStateDuplicate = async (gameName: string, incoming: Uint8Array): Promise<boolean> =>
    (await slotHashes(gameName)).has(hashBytes(incoming));

export async function deleteAllStates(gameName: string): Promise<void> {
    await commitManifest(gameName, EMPTY_MANIFEST);
    removeKey(SLOT_PREFIX + gameName);
}

/** List a game's states, newest first. Only checks that each state file exists
 *  and resolves thumbnail URLs — state bytes are read on load or download. */
export async function fetchStates(gameName: string): Promise<SaveState[]> {
    const keys = getSlotKeys(gameName);
    if (!keys.length) return [];
    const rows = await Promise.all(keys.map(async (key): Promise<SaveState | null> => {
        if (!await readSlotFile(key, STATE_EXT)) return null;
        return {
            key,
            savedAt: getTimestamp(key),
            thumbnail: await getThumbnailUrl(key),
            coverAspect: getCoverAspect(key),
        };
    }));
    return rows.filter((r): r is SaveState => r !== null).reverse();
}

export async function removeState(key: string, gameName: string): Promise<void> {
    const m = getManifest(gameName);
    await commitManifest(gameName, { ...m, slots: m.slots.filter(s => s !== key) });
}

const BUNDLE_STATE_ENTRY = 'state.bin';
const BUNDLE_THUMB_ENTRY = 'thumb.png';

async function unpackImportFile(file: File): Promise<{ state: Uint8Array; thumbnail: Blob | null }> {
    const buf = await file.arrayBuffer();
    const bytes = new Uint8Array(buf);
    if (!looksLikeZip(bytes.subarray(0, 4))) {
        return { state: bytes, thumbnail: null };
    }
    const entries = await readZipDirectory(file);
    const stateEntry = entries?.find(e => e.path === BUNDLE_STATE_ENTRY);
    if (!entries || !stateEntry) throw new Error('invalid bundle: missing state');
    const state = new Uint8Array(await new Response(await openZipEntry(file, stateEntry)).arrayBuffer());
    const thumbEntry = entries.find(e => e.path === BUNDLE_THUMB_ENTRY);
    const thumbnail = thumbEntry
        ? new Blob([await new Response(await openZipEntry(file, thumbEntry)).arrayBuffer()], { type: 'image/png' })
        : null;
    return { state, thumbnail };
}

export async function importState(gameName: string, file: File): Promise<void> {
    const { state: incoming, thumbnail } = await unpackImportFile(file);
    if (await isStateDuplicate(gameName, incoming)) throw new Error('duplicate');

    const key = `${gameName}.state_imported_${Date.now()}`;
    if (!await putStateBytes(key, incoming)) throw new Error('state storage unavailable');

    const m = getManifest(gameName);
    await commitManifest(gameName, { ...m, slots: withSlot(m, key) });
    stampSlot(key, new Date(file.lastModified || Date.now()));
    if (thumbnail) {
        const aspect = await measureImageAspect(thumbnail);
        await putStateThumbnail(key, thumbnail, aspect ?? DEFAULT_COVER_ASPECT);
    }
}

async function measureImageAspect(image: Blob): Promise<number | null> {
    try {
        const bitmap = await createImageBitmap(image);
        const aspect = bitmap.width > 0 && bitmap.height > 0 ? bitmap.width / bitmap.height : null;
        bitmap.close();
        return aspect;
    } catch {
        return null;
    }
}

function triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    Object.assign(document.createElement('a'), { href: url, download: filename }).click();
    URL.revokeObjectURL(url);
}

export async function downloadState(gameName: string, key: string, savedAt: Date | null): Promise<void> {
    const [state, thumb] = await Promise.all([
        readSlotFile(key, STATE_EXT),
        readSlotFile(key, THUMB_EXT),
    ]);
    if (!state) return;
    const datePart = savedAt
        ? savedAt.toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
            .replace(/[/:,]/g, '').replace(/\s+/g, ' ').trim()
        : 'Unknown';
    const baseName = `${gameName} - ${datePart}`;

    if (thumb) {
        const blob = buildZip([
            { path: BUNDLE_STATE_ENTRY, data: new Uint8Array(await state.arrayBuffer()) },
            { path: BUNDLE_THUMB_ENTRY, data: new Uint8Array(await thumb.arrayBuffer()) },
        ]);
        triggerDownload(blob, `${baseName}.zip`);
    } else {
        triggerDownload(state, `${baseName}.state`);
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
    const labelFor = (s: SaveState): string => {
        if (!s.savedAt) return 'Unknown';
        const day = new Date(s.savedAt.getFullYear(), s.savedAt.getMonth(), s.savedAt.getDate()).getTime();
        return day === today ? 'Today'
            : day === today - DAY_MS ? 'Yesterday'
            : s.savedAt.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
    };
    return Array.from(groupBy(states, labelFor), ([label, items]) => ({ label, items }));
}
