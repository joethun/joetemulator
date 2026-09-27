import { getSystemNameByCore } from '@/lib/constants';
import { computeRomCrc } from '@/lib/crc32';
import { stripExt } from '@/lib/utils';
import { openZipEntry, readZipDirectory } from '@/lib/zip';

interface OpenFilePickerWindow extends Window {
    showOpenFilePicker?: (opts: { multiple?: boolean }) => Promise<Array<{ getFile(): Promise<File> }>>;
}

export async function selectFiles(): Promise<File[]> {
    const w = window as OpenFilePickerWindow;
    if (w.showOpenFilePicker) {
        const handles = await w.showOpenFilePicker({ multiple: true });
        return Promise.all(handles.map(h => h.getFile()));
    }
    return new Promise(resolve => {
        const input = Object.assign(document.createElement('input'), {
            type: 'file', multiple: true,
            onchange: () => resolve(Array.from(input.files || [])),
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
    'pce', 'pcx', 'fx', 'ws', 'wsc', 'ngp', 'ngc', 'int',
    'adf', 'd64', 'prg', 't64', 'tap', 'crt', 'col', 'rom', 'jag',
].map((ext, i) => [ext, i]));

export const fileExt = (name: string) => name.split('.').pop()?.toLowerCase() ?? '';

/** PK\x03\x04 / PK\x05\x06 / PK\x07\x08 — the three valid ZIP local-file headers. */
export const looksLikeZip = (header: Uint8Array): boolean =>
    header.length >= 4
    && header[0] === 0x50 && header[1] === 0x4B
    && (header[2] === 0x03 || header[2] === 0x05 || header[2] === 0x07);

// macOS zips ship "__MACOSX/" resource forks and ".DS_Store" alongside the content.
export const isJunkPath = (path: string) =>
    path.startsWith('__MACOSX/') || (path.split('/').pop() ?? '').startsWith('.');

/** Order archive members so the likeliest ROM comes first: known ROM
 *  extensions by priority, then the largest file. */
export function rankRomEntries<T extends { path: string; size: number }>(entries: T[]): T[] {
    const candidates = entries.filter(e => !isJunkPath(e.path) && fileExt(e.path) in ROM_EXT_RANK);
    const pool = candidates.length ? candidates : entries.filter(e => !isJunkPath(e.path));
    return [...pool].sort((a, b) =>
        (ROM_EXT_RANK[fileExt(a.path)] ?? 999) - (ROM_EXT_RANK[fileExt(b.path)] ?? 999)
        || b.size - a.size);
}

/** The ROM inside a zipped cartridge dump, or null if `file` isn't a usable zip. */
export async function extractRomFromZip(file: File): Promise<{ name: string; bytes: Uint8Array<ArrayBuffer> } | null> {
    const entries = await readZipDirectory(file);
    const entry = entries && rankRomEntries(entries)[0];
    if (!entry) return null;
    try {
        const bytes = new Uint8Array(await new Response(await openZipEntry(file, entry)).arrayBuffer());
        return { name: entry.path.split('/').pop() || entry.path, bytes };
    } catch (err) {
        console.warn('Zip extraction failed:', err);
        return null;
    }
}

// CRC matching is skipped for roms larger than this.
const MAX_CRC_BYTES = 516 * 1024 * 1024;

async function sha1Hex(bytes: Uint8Array<ArrayBuffer>): Promise<string | null> {
    try {
        return toHex(await crypto.subtle.digest('SHA-1', bytes));
    } catch (e) {
        console.warn('SHA-1 hash failed (proceeding without it):', e);
        return null;
    }
}

/** PlayStation-family disc serial (e.g. SLUS-012.34 → slus01234) from the image header. */
function findSerial(bytes: Uint8Array): string | null {
    const head = new TextDecoder('ascii').decode(bytes.subarray(0, 512 * 1024)).replace(/\0/g, ' ');
    const m = head.match(/[ST][LCB][UEPKA][SPMEJ][-_]?\d{3}\.?\d{2}/i);
    return m ? m[0].replace(/[-_.]/g, '').toLowerCase() : null;
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
    'Intellivision': 'Mattel - Intellivision',
    'SNK Neo Geo Pocket': 'SNK - Neo Geo Pocket',
    'Bandai WonderSwan': 'Bandai - WonderSwan',
};

/** Libretro database/thumbnail system name for one of our system names. */
const datSystem = (systemName: string) => LR_MAP[systemName] ?? systemName;

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
    fetchDat(datSystem(getSystemNameByCore(core)));
}

// Region preference order for name-based fallback
const REGION_PRIORITY = ['(USA)', '(USA, Europe)', '(World)', '(Europe)', '(En)'];

// Normalize a title for fuzzy comparison: lowercase, strip all non-alphanumeric chars
export const normalizeTitle = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '');

// Strip parenthesized region/version tags, e.g. "Game (USA) (Rev 1)" -> "Game"
const stripParenTags = (s: string) => s.replace(/\s*\([^)]*\)/g, '').trim();

const regionRank = (title: string): number => {
    const i = REGION_PRIORITY.findIndex(r => title.includes(r));
    return i === -1 ? REGION_PRIORITY.length : i;
};

// Bare title -> best-region DAT entry, built once per DAT. Keyed on the parsed
// DAT object (stable per system via datCache), so importing a batch of roms
// normalizes each DAT's titles once instead of once per file.
const nameIndexCache = new WeakMap<Record<string, string>, Map<string, string>>();

function nameIndex(datMap: Record<string, string>): Map<string, string> {
    const cached = nameIndexCache.get(datMap);
    if (cached) return cached;

    const index = new Map<string, string>();
    for (const title of Object.values(datMap)) {
        // Strip region/version tags to get the bare title for comparison
        const bare = normalizeTitle(stripParenTags(title));
        const best = index.get(bare);
        if (best === undefined || regionRank(title) < regionRank(best)) index.set(bare, title);
    }
    nameIndexCache.set(datMap, index);
    return index;
}

const findByName = (cleanTitle: string, datMap: Record<string, string>): string | null =>
    nameIndex(datMap).get(normalizeTitle(cleanTitle)) ?? null;

/**
 * Box-art URL for a rom, matched against the system's DAT by CRC, then SHA-1,
 * then disc serial, then `fileName`'s bare title. Each hash is computed only
 * if the previous lookup missed.
 */
export async function calculateAutoCoverArt(rom: File, fileName: string, core: string): Promise<string | null> {
    const systemName = getSystemNameByCore(core);
    const lrSys = datSystem(systemName);

    try {
        const [bytes, datMap] = await Promise.all([
            extractRomFromZip(rom).then(async r => r?.bytes ?? new Uint8Array(await rom.arrayBuffer())),
            fetchDat(lrSys).catch(() => ({} as Record<string, string>)),
        ]);

        const lookup = async (): Promise<string | null> => {
            if (bytes.byteLength <= MAX_CRC_BYTES) {
                const hit = datMap[computeRomCrc(bytes, systemName)];
                if (hit) return hit;
            }
            const sha1 = await sha1Hex(bytes);
            if (sha1 && datMap[sha1]) return datMap[sha1];
            const serial = findSerial(bytes);
            if (serial && datMap[serial]) return datMap[serial];
            return findByName(stripParenTags(stripExt(fileName)), datMap);
        };

        const hashName = await lookup();
        if (!hashName) return null;
        return `https://thumbnails.libretro.com/${encodeURIComponent(lrSys)}/Named_Boxarts/${encodeURIComponent(hashName)}.png`;
    } catch {
        return null;
    }
}
