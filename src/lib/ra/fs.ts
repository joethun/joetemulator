import type { CoreInfo, LibretroModule } from '@/lib/ra/types';
import { openExistingDB } from '@/lib/utils';

const SAVES_DIR = '/data/saves';
export const RA_CFG_PATH = '/home/web_user/.config/retroarch/retroarch.cfg';
const CORE_OPTS_DIR = '/home/web_user/retroarch/userdata/config';

export const RETROARCH_CFG = [
    'autosave_interval = 60',
    'screenshot_directory = "/"',
    'block_sram_overwrite = false',
    'video_gpu_screenshot = false',
    'audio_latency = 64',
    'video_top_portrait_viewport = true',
    'video_vsync = true',
    'video_smooth = false',
    'fastforward_ratio = 0',
    'slowmotion_ratio = 0',
    `savefile_directory = "${SAVES_DIR}"`,
    // melonDS DS (and other newer cores) refuse to load content without a real
    // system directory ("No system directory is available").
    'system_directory = "/home/web_user/retroarch/system"',
    // Browser microphone capture. Our RetroArch fork builds the rwebmic driver
    // (audio/drivers_microphone/rwebmic.c + emscripten/library_rwebmic.js);
    // RetroArch would otherwise pick the null driver and cores would get
    // silence. microphone_enable defaults to true upstream.
    'microphone_driver = "rwebmic"',
].join('\n') + '\n';

function mkdirP(mod: LibretroModule, path: string): void {
    let current = '';
    for (const part of path.split('/').filter(Boolean)) {
        current += '/' + part;
        try { mod.FS.mkdir(current); } catch { /* exists */ }
    }
}

export function writeFile(mod: LibretroModule, path: string, data: Uint8Array | string): void {
    const slash = path.lastIndexOf('/');
    if (slash > 0) mkdirP(mod, path.slice(0, slash));
    mod.FS.writeFile(path, data);
}

export function mountSaveFS(mod: LibretroModule): Promise<void> {
    return new Promise((resolve, reject) => {
        try {
            mkdirP(mod, SAVES_DIR);
            mod.FS.mount(mod.FS.filesystems.IDBFS, { autoPersist: true }, SAVES_DIR);
            mod.FS.syncfs(true, err => err ? reject(err) : resolve());
        } catch (e) {
            reject(e instanceof Error ? e : new Error(String(e)));
        }
    });
}

export function unmountSaveFS(mod: LibretroModule): void {
    try { mod.FS.unmount(SAVES_DIR); } catch { /* not mounted */ }
}

export function writeCoreOptionsFile(mod: LibretroModule, info: CoreInfo): void {
    const { file, settings } = info.options ?? {};
    if (!file || !settings) return;
    const body = Object.entries(settings).map(([k, v]) => `${k} = "${v}"`).join('\n') + '\n';
    writeFile(mod, `${CORE_OPTS_DIR}/${file}`, body);
}

// Emscripten's IDBFS keeps a mount in a database named after its mount point,
// one record per file keyed by full path.
const IDBFS_STORE = 'FILE_DATA';

/**
 * Delete a game's in-game saves (SRAM, memory card…) from the IDBFS store
 * behind SAVES_DIR. Only call while no core is mounted — a live mount would
 * sync its in-memory copy straight back. Cores name saves after the boot file
 * (disc 1's name for multi-disc sets), so they're `<saveName>.<ext>`, either
 * in SAVES_DIR or a per-core folder inside it (e.g. `FCEUmm/`).
 */
export async function deleteSaveFiles(saveName: string): Promise<void> {
    // No database means nothing was ever saved.
    const db = await openExistingDB(SAVES_DIR);
    if (!db) return;
    if (!db.objectStoreNames.contains(IDBFS_STORE)) { db.close(); return; }
    const escaped = saveName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // A bare extension only: "Game.v2.srm" belongs to "Game.v2", not "Game".
    const ours = new RegExp(`^${SAVES_DIR}/(?:[^/]+/)?${escaped}\\.[^./]+$`);
    return new Promise((resolve, reject) => {
        const tx = db.transaction(IDBFS_STORE, 'readwrite');
        const store = tx.objectStore(IDBFS_STORE);
        // Keys only: a value cursor would load every game's save contents.
        const keysReq = store.getAllKeys();
        keysReq.onsuccess = () => {
            for (const key of keysReq.result) {
                if (ours.test(String(key))) store.delete(key);
            }
        };
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = () => { db.close(); reject(tx.error); };
    });
}
