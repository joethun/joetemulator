import { getSystemNameByCore } from '@/lib/constants';
import { stripExt } from '@/lib/utils';

export async function selectFiles(): Promise<File[]> {
    if ('showOpenFilePicker' in window) {
        const handles = await (window as any).showOpenFilePicker({ multiple: true });
        return Promise.all(handles.map((h: any) => h.getFile()));
    }
    return new Promise(resolve => {
        const input = Object.assign(document.createElement('input'), {
            type: 'file', multiple: true,
            onchange: () => resolve(Array.from(input.files || []))
        });
        input.click();
    });
}

// Hex lookup table — much faster than Array.from().map(b => b.toString(16))
const HEX = Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, '0'));
const toHex = (buf: ArrayBuffer) => {
    const bytes = new Uint8Array(buf);
    let s = '';
    for (let i = 0; i < bytes.length; i++) s += HEX[bytes[i]];
    return s;
};

// ROM extensions, ordered by priority. Rank by index; `ext in ROM_EXT_RANK` is the presence check.
const ROM_EXT_RANK: Record<string, number> = Object.fromEntries([
    'nes', 'sfc', 'smc', 'gb', 'gbc', 'gba', 'n64', 'z64', 'v64', 'nds',
    'md', 'gen', 'smd', 'sms', 'gg', 'iso', 'bin', 'img', 'cue', 'chd',
    'psx', 'pbp', 'cso', 'a26', 'a52', 'a78', 'lnx', 'j64',
    'pce', 'pcx', 'fx', 'ws', 'wsc', 'ngp', 'ngc',
    'adf', 'd64', 'prg', 't64', 'tap', 'crt', 'col', 'rom', 'jag',
].map((ext, i) => [ext, i]));

const fileExt = (name: string) => name.split('.').pop()?.toLowerCase() ?? '';

async function extractRomBytesFromZip(file: File): Promise<ArrayBuffer | null> {
    const header = new Uint8Array(await file.slice(0, 4).arrayBuffer());
    const isZip = header[0] === 0x50 && header[1] === 0x4B &&
        (header[2] === 0x03 || header[2] === 0x05 || header[2] === 0x07);
    if (!isZip) return null;

    try {
        const JSZip = (await import('jszip')).default;
        const zip = await JSZip.loadAsync(await file.arrayBuffer());
        const entries = Object.values(zip.files).filter(f => !f.dir);
        if (!entries.length) return null;

        const candidates = entries.filter(f => fileExt(f.name) in ROM_EXT_RANK);
        const pool = candidates.length ? candidates : entries;

        pool.sort((a, b) => {
            const rankDiff = (ROM_EXT_RANK[fileExt(a.name)] ?? 999) - (ROM_EXT_RANK[fileExt(b.name)] ?? 999);
            if (rankDiff !== 0) return rankDiff;
            return ((b as any)._data?.uncompressedSize ?? 0) - ((a as any)._data?.uncompressedSize ?? 0);
        });

        return pool[0].async('arraybuffer');
    } catch (err) {
        console.warn('Zip extraction failed:', err);
        return null;
    }
}

type FileHashes = {
    crc: string;
    serialId: string | null;
    fileSha1: string | null;
};

// Raw buffer work that is system-agnostic — cached independently of system
type RawFileData = {
    buffer: ArrayBuffer;
    serialId: string | null;
    fileSha1: string | null;
};

const rawDataCache = new WeakMap<File, Promise<RawFileData>>();

async function getRawFileData(file: File): Promise<RawFileData> {
    if (rawDataCache.has(file)) return rawDataCache.get(file)!;

    const promise = (async (): Promise<RawFileData> => {
        const zipBytes = await extractRomBytesFromZip(file);
        const buffer = zipBytes ?? await file.arrayBuffer();

        let fileSha1: string | null = null;
        try {
            fileSha1 = toHex(await crypto.subtle.digest('SHA-1', buffer));
        } catch { }

        const scanLen = Math.min(buffer.byteLength, 512 * 1024);
        const headStr = new TextDecoder('ascii').decode(new Uint8Array(buffer, 0, scanLen)).replace(/\0/g, ' ');
        const psMatch = headStr.match(/[ST][LCB][UEPKA][SPMEJ][-_]?\d{3}\.?\d{2}/i);
        const serialId = psMatch ? psMatch[0].replace(/[-_.]/g, '').toLowerCase() : null;

        return { buffer, serialId, fileSha1 };
    })();

    // Evict on failure so the next call retries rather than getting a cached rejection
    promise.catch(() => { if (rawDataCache.get(file) === promise) rawDataCache.delete(file); });
    rawDataCache.set(file, promise);
    return promise;
}

async function getFileHashes(file: File, systemName: string): Promise<FileHashes> {
    const { buffer, serialId, fileSha1 } = await getRawFileData(file);

    const { computeRomCrc } = await import('@/lib/crc32');
    const crc = buffer.byteLength <= 516 * 1024 * 1024
        ? computeRomCrc(new Uint8Array(buffer), systemName)
        : '';

    return { crc, serialId, fileSha1 };
}

const LR_MAP: Record<string, string> = {
    'NES': 'Nintendo - Nintendo Entertainment System',
    'Game Boy': 'Nintendo - Game Boy',
    'Game Boy Color': 'Nintendo - Game Boy Color',
    'Game Boy Advance': 'Nintendo - Game Boy Advance',
    'SNES': 'Nintendo - Super Nintendo Entertainment System',
    'Virtual Boy': 'Nintendo - Virtual Boy',
    'N64': 'Nintendo - Nintendo 64',
    'DS': 'Nintendo - Nintendo DS',
    'Master System': 'Sega - Master System - Mark III',
    'Genesis': 'Sega - Mega Drive - Genesis',
    'Game Gear': 'Sega - Game Gear',
    'CD': 'Sega - Mega-CD - Sega CD',
    '32X': 'Sega - 32X',
    'Saturn': 'Sega - Saturn',
    'PS1': 'Sony - PlayStation',
    'PSP': 'Sony - PlayStation Portable',
    '2600': 'Atari - 2600',
    '5200': 'Atari - 5200',
    '7800': 'Atari - 7800',
    'Lynx': 'Atari - Lynx',
    'Jaguar': 'Atari - Jaguar',
    'Amiga': 'Commodore - Amiga',
    '64': 'Commodore - 64',
    'VIC-20': 'Commodore - VIC-20',
    'Plus/4': 'Commodore - Plus-4',
    'FBNeo': 'FBNeo - Arcade Games',
    'M.A.M.E': 'MAME',
    'TurboGrafx-16': 'NEC - PC Engine - TurboGrafx 16',
    'PC-FX': 'NEC - PC-FX',
    'Panasonic 3DO': 'Panasonic - 3DO',
    'Microsoft DOS': 'DOS',
    'ColecoVision': 'Coleco - ColecoVision',
    'SNK Neo Geo Pocket': 'SNK - Neo Geo Pocket',
    'Bandai WonderSwan': 'Bandai - WonderSwan',
};

// Cache DAT JSON in memory — same system's DAT is only fetched once per session
const datCache = new Map<string, Promise<Record<string, string>>>();

function fetchDat(lrSys: string): Promise<Record<string, string>> {
    if (datCache.has(lrSys)) return datCache.get(lrSys)!;
    const p = fetch(`/dats/${lrSys}.json`)
        .then(r => r.ok ? r.json() as Promise<Record<string, string>> : Promise.reject(new Error(`HTTP ${r.status}`)))
        .catch(err => { datCache.delete(lrSys); return Promise.reject(err); });
    datCache.set(lrSys, p);
    return p;
}

/**
 * Start fetching the DAT for a system immediately (e.g. when a system is selected
 * in the picker), so it's cached by the time calculateAutoCoverArt is called.
 */
export function prewarmDat(core: string): void {
    const systemName = getSystemNameByCore(core);
    const lrSys = LR_MAP[systemName] ?? systemName;
    fetchDat(lrSys);
}

// Region preference order for name-based fallback
const REGION_PRIORITY = ['(USA)', '(USA, Europe)', '(World)', '(Europe)', '(En)'];

// Normalize a title for fuzzy comparison: lowercase, strip all non-alphanumeric chars
const normalizeTitle = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '');

function findByName(cleanTitle: string, datMap: Record<string, string>): string | null {
    const needle = normalizeTitle(cleanTitle);
    let best: string | null = null;
    let bestPriority = Infinity;

    for (const title of Object.values(datMap)) {
        // Strip region/version tags to get the bare title for comparison
        const bare = normalizeTitle(title.replace(/\s*\([^)]*\)/g, '').trim());
        if (bare !== needle) continue;

        const priority = REGION_PRIORITY.findIndex(r => title.includes(r));
        const p = priority === -1 ? REGION_PRIORITY.length : priority;
        if (p < bestPriority) { bestPriority = p; best = title; }
    }

    return best;
}

export async function calculateAutoCoverArt(file: File, core: string, opfsFile?: File): Promise<string | null> {
    if (typeof window === 'undefined') return null;

    const systemName = getSystemNameByCore(core);
    const lrSys = LR_MAP[systemName] ?? systemName;
    const hashFile = opfsFile ?? file;

    try {
        const [hashes, datMap] = await Promise.all([
            getFileHashes(hashFile, systemName),
            fetchDat(lrSys).catch(() => ({} as Record<string, string>)),
        ]);

        const { crc, serialId, fileSha1 } = hashes;

        const hashName =
            datMap[crc] ?? datMap[crc.toLowerCase()] ??
            (fileSha1 && datMap[fileSha1]) ??
            (serialId && datMap[serialId]) ??
            findByName(stripExt(file.name).replace(/\s*\([^)]*\)/g, '').trim(), datMap) ??
            null;

        if (!hashName) return null;
        return `https://thumbnails.libretro.com/${encodeURIComponent(lrSys)}/Named_Boxarts/${encodeURIComponent(hashName)}.png`;
    } catch {
        return null;
    }
}
