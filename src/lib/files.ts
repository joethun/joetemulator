import { getSystemNameByCore } from '@/lib/constants';
import { fuzzyMatchTitle, stripExt } from '@/lib/utils';

export async function selectFiles(): Promise<File[]> {
    if ('showOpenFilePicker' in window) {
        const handles = await (window as any).showOpenFilePicker({ multiple: true });
        return Promise.all(handles.map((h: any) => h.getFile()));
    }

    return new Promise(resolve => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.onchange = () => resolve(Array.from(input.files || []));
        input.click();
    });
}

const fileHashCache = new WeakMap<File, Promise<{
    crc: string | number;
    chdSha1: string | null;
    serialId: string | null;
    fileSha1: string | null;
    pureCUEStr: string | null;
}>>();

async function getFileHashes(file: File, systemName: string) {
    if (fileHashCache.has(file)) return fileHashCache.get(file)!;

    const promise = (async () => {
        const buffer = await file.arrayBuffer();
        let crc: string | number = '';
        let chdSha1: string | null = null;
        let serialId: string | null = null;
        let fileSha1: string | null = null;
        let pureCUEStr: string | null = null;

        if (buffer.byteLength <= 516 * 1024 * 1024) {
            const { computeRomCrc } = await import('@/lib/crc32');
            crc = computeRomCrc(new Uint8Array(buffer), systemName);
        }

        const magic = new TextDecoder('ascii').decode(new Uint8Array(buffer, 0, 8));
        if (magic === 'MComprHD') {
            const view = new DataView(buffer);
            const version = view.getUint32(12, false);
            let shaOffset = 0;
            if (version === 5) shaOffset = 64;
            else if (version === 4) shaOffset = 84;
            if (shaOffset) {
                chdSha1 = Array.from(new Uint8Array(buffer, shaOffset, 20)).map(b => b.toString(16).padStart(2, '0')).join('').toLowerCase();
            }

            const tailScanStr = new TextDecoder('ascii').decode(new Uint8Array(buffer, Math.max(0, buffer.byteLength - 1024 * 1024)));
            const cueMatch = tailScanStr.match(/FILE "([^"]+?)(?: \((?:Track|Disc)[^)]*\))?\.(?:bin|iso|img)"/i);
            if (cueMatch && cueMatch[1]) {
                pureCUEStr = cueMatch[1].replace(/[&*/:<>?\\|]/g, '_');
            }
        } else {
            try {
                const sha1Buffer = await crypto.subtle.digest("SHA-1", buffer);
                fileSha1 = Array.from(new Uint8Array(sha1Buffer)).map(b => b.toString(16).padStart(2, '0')).join('').toLowerCase();
            } catch (e) { }

            const scanLen = Math.min(buffer.byteLength, 4 * 1024 * 1024);
            const headStr = new TextDecoder('ascii').decode(new Uint8Array(buffer, 0, scanLen)).replace(/\0/g, ' ');
            const psMatch = headStr.match(/[ST][LCB][UEPKA][SPMEJ][-_]?\d{3}\.?\d{2}/i);
            if (psMatch) serialId = psMatch[0].replace(/[-_.]/g, '').toLowerCase();
        }

        return { crc, chdSha1, serialId, fileSha1, pureCUEStr };
    })();

    fileHashCache.set(file, promise);
    return promise;
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
    '128': 'Commodore - 128',
    'PET': 'Commodore - PET',
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
    'Bandai WonderSwan': 'Bandai - WonderSwan'
};

export async function calculateAutoCoverArt(file: File | undefined, core: string, fallbackName?: string): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    let coverArt: string | null = null;
    let systemName = getSystemNameByCore(core);

    try {
        const lrSys = LR_MAP[systemName] || systemName;

        let crc: string | number = '';
        let chdSha1 = null;
        let serialId = null;
        let fileSha1 = null;
        let pureCUEStr: string | null = null;

        if (file) {
            const hashes = await getFileHashes(file, systemName);
            crc = hashes.crc;
            chdSha1 = hashes.chdSha1;
            serialId = hashes.serialId;
            fileSha1 = hashes.fileSha1;
            pureCUEStr = hashes.pureCUEStr;
        }

        const datRes = await fetch(`/dats/${lrSys}.json`);
        if (datRes.ok) {
            const datMap = await datRes.json();
            const sCrc = String(crc);
            const hashName = file ? (datMap[crc] || datMap[sCrc.toLowerCase()] || datMap[sCrc.toUpperCase()] || (fileSha1 && datMap[fileSha1]) || (chdSha1 && datMap[chdSha1]) || (serialId && datMap[serialId])) : null;
            let baseName = file ? file.name : (fallbackName || 'Unknown');
            let cleanName = stripExt(baseName).replace(/ \((Disc|CD) [A-Za-z0-9]+\)/i, '').replace(/[&*/:<>?\\|]/g, '_');

            if (hashName) {
                coverArt = `https://thumbnails.libretro.com/${encodeURIComponent(lrSys)}/Named_Boxarts/${encodeURIComponent(hashName)}.png`;
            } else {
                const titles = Array.from(new Set(Object.values(datMap) as string[]));
                let searchStr = pureCUEStr || cleanName;

                if (titles.includes(searchStr)) {
                    coverArt = `https://thumbnails.libretro.com/${encodeURIComponent(lrSys)}/Named_Boxarts/${encodeURIComponent(searchStr)}.png`;
                } else {
                    const fuzzyMatch = fuzzyMatchTitle(searchStr, titles);
                    let resolvedName = fuzzyMatch || searchStr;
                    coverArt = `https://thumbnails.libretro.com/${encodeURIComponent(lrSys)}/Named_Boxarts/${encodeURIComponent(resolvedName)}.png`;
                }
            }
        }

        if (!coverArt) {
            let baseName = file ? file.name : (fallbackName || 'Unknown');
            let cleanName = stripExt(baseName).replace(/ \((Disc|CD) [A-Za-z0-9]+\)/i, '').replace(/[&*/:<>?\\|]/g, '_');
            coverArt = `https://thumbnails.libretro.com/${encodeURIComponent(lrSys)}/Named_Boxarts/${encodeURIComponent(pureCUEStr || cleanName)}.png`;
        }
    } catch (err) {
        console.warn('Auto cover art fetch failed:', err);
    }

    return coverArt;
}
