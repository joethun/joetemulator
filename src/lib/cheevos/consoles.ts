import { DISC_EXTS } from '@/lib/discs';
import { fileExt } from '@/lib/files';

// RetroAchievements console ids (rc_consoles.h) for each SYSTEM_PICKER id.
// Systems RA doesn't support (C128, PET, Plus/4) are absent.
const SYSTEM_CONSOLE: Record<string, number> = {
    nes: 7,
    snes: 3,
    gb: 4,
    gbc: 6,
    gba: 5,
    n64: 2,
    melonds: 18,
    vb: 28,
    segaMS: 11,
    genesis_plus_gx: 15,   // the Game Gear picker entry
    segaMD: 1,
    segaCD: 9,
    sega32x: 10,
    segaSaturn: 39,
    psx: 12,
    psp: 41,
    atari2600: 25,
    atari5200: 50,
    atari7800: 51,
    lynx: 13,
    jaguar: 17,
    coleco: 44,
    intellivision: 45,
    pce: 8,
    pcfx: 49,
    ngp: 14,
    ws: 53,
    arcade: 27,
    mame2003_plus: 27,
    opera: 43,
    dosbox_pure: 26,
    amiga: 35,
    vice_x64: 30,
    vice_xvic: 34,
};

/**
 * RA console id for a game, or null when RA doesn't cover the system. The
 * extension refines a few pickers that span several RA consoles (a .gbc run
 * under the Game Boy picker needs the GBC memory map, a PCE disc is PC Engine CD).
 */
export function consoleIdFor(system: string, bootName: string): number | null {
    const ext = fileExt(bootName);
    if (system === 'gb' || system === 'gbc') return ext === 'gbc' ? 6 : ext === 'gb' ? 4 : SYSTEM_CONSOLE[system];
    if (system === 'pce' && (DISC_EXTS.has(ext) || ext === 'm3u')) return 76;
    if (system === 'segaMS' && ext === 'gg') return 15;
    if (system === 'segaMS' && ext === 'sg') return 33;
    return SYSTEM_CONSOLE[system] ?? null;
}

// libretro `library_name` values, which key rc_libretro's per-core list of
// settings that are banned in hardcore (PAL regions, cheat devices, …).
const LIBRARY_NAMES: Record<string, string> = {
    fceumm: 'FCEUmm',
    nestopia: 'Nestopia',
    snes9x: 'Snes9x',
    genesis_plus_gx: 'Genesis Plus GX',
    genesis_plus_gx_wide: 'Genesis Plus GX Wide',
    picodrive: 'PicoDrive',
    smsplus: 'SMS Plus GX',
    pcsx_rearmed: 'PCSX-ReARMed',
    mednafen_psx_hw: 'Beetle PSX HW',
    ppsspp: 'PPSSPP',
    fbneo: 'FinalBurn Neo',
    dosbox_pure: 'DOSBox-pure',
    melonds: 'melonDS',
    // rc_libretro keys the melonDS DS rules under "melonDS" (NDS only).
    melondsds: 'melonDS',
    virtualjaguar: 'Virtual Jaguar',
    vice_x64: 'VICE x64',
    cap32: 'cap32',
};

export const libraryNameFor = (libretroName: string): string =>
    LIBRARY_NAMES[libretroName] ?? libretroName;
