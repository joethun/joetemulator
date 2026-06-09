import type { CoreInfo, LibretroModule } from '@/lib/ra/types';

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
    // Browser microphone capture (custom driver in our RetroArch build); the
    // built-in default is the null driver, so it must be selected explicitly.
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
