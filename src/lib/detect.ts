import type { PendingFile } from '@/types';
import { fileExt, isJunkPath } from '@/lib/files';
import { IGNORABLE_EXTS } from '@/lib/discs';
import { readZipDirectory } from '@/lib/zip';

/**
 * File extensions that map unambiguously to a single system, used to skip the
 * system picker when a game is added. Values are `game.core` ids from
 * SYSTEM_PICKER in constants.ts — keep them in sync.
 *
 * Deliberately excludes disc/disk-image extensions shared across systems
 * (iso, bin, cue, chd, img, pbp, …) and Commodore disk formats (d64, prg, tap):
 * those are ambiguous, so they fall through to the picker.
 */
const EXT_TO_CORE: Record<string, string> = {
    // Nintendo
    nes: 'nes', fds: 'nes', unf: 'nes', unif: 'nes',
    gb: 'gb', gbc: 'gbc', gba: 'gba',
    sfc: 'snes', smc: 'snes', swc: 'snes', fig: 'snes',
    vb: 'vb', vboy: 'vb',
    n64: 'n64', z64: 'n64', v64: 'n64',
    nds: 'melonds',
    // Sega
    sms: 'segaMS',
    gg: 'genesis_plus_gx',
    md: 'segaMD', gen: 'segaMD', smd: 'segaMD',
    '32x': 'sega32x',
    // Sony
    cso: 'psp',
    // Atari
    a26: 'atari2600', a52: 'atari5200', a78: 'atari7800',
    lnx: 'lynx', j64: 'jaguar', jag: 'jaguar',
    // Commodore
    adf: 'amiga',
    // NEC
    pce: 'pce', sgx: 'pce',
    // Other
    ws: 'ws', wsc: 'ws',
    ngp: 'ngp', ngc: 'ngp',
    int: 'intellivision',
    col: 'coleco',
};

/** Detect a system core from a file name's extension, or null if the
 *  extension is unknown or shared across systems. */
export const detectCoreFromName = (name: string): string | null =>
    EXT_TO_CORE[fileExt(name)] ?? null;

/**
 * Detect a system core from the contents of a zip (a zipped cartridge ROM).
 * Returns a core only when every content file (ignoring readme/art extras)
 * resolves to the same system; anything mixed, unknown, or ambiguous (arcade
 * romsets, DOS games, disc images) returns null so the user picks. Only the
 * zip's central directory is read — a few KB regardless of the zip's size.
 */
export async function detectCoreFromZip(file: File): Promise<string | null> {
    const entries = (await readZipDirectory(file))?.filter(e => !isJunkPath(e.path));
    if (!entries?.length) return null;

    const content = entries.filter(e => !IGNORABLE_EXTS.has(fileExt(e.path)));
    if (!content.length) return null;

    let core: string | null = null;
    for (const e of content) {
        const detected = detectCoreFromName(e.path);
        if (!detected || (core && detected !== core)) return null;
        core = detected;
    }
    return core;
}

/**
 * Detect the system for a pending game, or null if it should go to the picker.
 * Multi-disc sets and loose disc images stay ambiguous on purpose; a lone zip
 * is peeked for a zipped cartridge ROM.
 */
export async function detectPendingCore(item: PendingFile): Promise<string | null> {
    if (item.zip) return null;                 // zipped disc set — ambiguous CD image
    if (item.files.length !== 1) return null;  // loose multi-disc set — ambiguous
    const file = item.files[0];
    return fileExt(file.name) === 'zip'
        ? detectCoreFromZip(file)
        : detectCoreFromName(file.name);
}
