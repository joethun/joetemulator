import { getStringRecordEntry, setStringRecordEntry } from '@/lib/ra/storage';

const SYSTEM_TO_CORES: Record<string, readonly string[]> = {
    atari2600: ['stella2014'],
    atari5200: ['a5200'],
    atari7800: ['prosystem'],
    arcade:    ['fbneo', 'fbalpha2012_cps1', 'fbalpha2012_cps2'],
    amiga:     ['puae'],
    c64:       ['vice_x64sc'],
    c128:      ['vice_x128'],
    coleco:    ['gearcoleco'],
    dos:       ['dosbox_pure'],
    gb:        ['gambatte'],
    gbc:       ['gambatte'],
    gba:       ['mgba'],
    intellivision: ['freeintv'],
    jaguar:    ['virtualjaguar'],
    lynx:      ['handy'],
    mame:      ['mame2003_plus', 'mame2003'],
    n64:       ['mupen64plus_next', 'parallel_n64'],
    nds:       ['melonds', 'melondsds', 'desmume', 'desmume2015'],
    nes:       ['fceumm', 'nestopia'],
    ngp:       ['mednafen_ngp'],
    pce:       ['mednafen_pce'],
    pcfx:      ['mednafen_pcfx'],
    pet:       ['vice_xpet'],
    plus4:     ['vice_xplus4'],
    psp:       ['ppsspp'],
    psx:       ['pcsx_rearmed', 'mednafen_psx_hw'],
    sega:      ['genesis_plus_gx', 'picodrive'],
    sega32x:   ['picodrive'],
    segaCD:    ['genesis_plus_gx', 'picodrive'],
    segaGG:    ['genesis_plus_gx'],
    segaMD:    ['genesis_plus_gx', 'picodrive'],
    segaMS:    ['smsplus', 'genesis_plus_gx', 'picodrive'],
    segaSaturn:['yabause'],
    snes:      ['snes9x'],
    vb:        ['beetle_vb'],
    vic20:     ['vice_xvic'],
    ws:        ['mednafen_wswan'],
    '3do':     ['opera'],

    // Legacy system ids — SYSTEM_PICKER persisted these libretro core names
    // directly as `game.core`, so older library entries look them up by core
    // name instead of canonical system id.
    melonds:         ['melondsds', 'melonds', 'desmume', 'desmume2015'],
    mame2003_plus:   ['mame2003_plus', 'mame2003'],
    genesis_plus_gx: ['genesis_plus_gx'],
    vice_x64:        ['vice_x64'],
    vice_x128:       ['vice_x128'],
    vice_xpet:       ['vice_xpet'],
    vice_xvic:       ['vice_xvic'],
    vice_xplus4:     ['vice_xplus4'],
    opera:           ['opera'],
    dosbox_pure:     ['dosbox_pure'],
};

export const CORES_REQUIRING_THREADS = new Set(['ppsspp', 'dosbox_pure', 'melondsds']);
export const CORES_REQUIRING_WEBGL2 = new Set(['ppsspp', 'melondsds']);

// Single-player consoles (handhelds + Game Gear) get no player switcher.
const SINGLE_PLAYER = new Set([
    'gb', 'gbc', 'gba', 'melonds', 'vb', 'psp',
    'lynx', 'ngp', 'ws', 'genesis_plus_gx',
]);
const FOUR_PLAYER = new Set(['n64', 'atari5200']);

export function resolveLibretroCore(system: string, override?: string): string {
    const candidates = SYSTEM_TO_CORES[system];
    if (override && candidates?.includes(override)) return override;
    return candidates?.[0] ?? system;
}

export const getCoresForSystem = (system: string): readonly string[] =>
    SYSTEM_TO_CORES[system] ?? [];

export const getMaxPlayers = (system: string): number =>
    SINGLE_PLAYER.has(system) ? 1 : FOUR_PLAYER.has(system) ? 4 : 2;

const CORE_DISPLAY_NAMES: Record<string, string> = {
    a5200:                'a5200',
    beetle_vb:            'Beetle VB',
    desmume:              'DeSmuME',
    desmume2015:          'DeSmuME 2015',
    dosbox_pure:          'DOSBox Pure',
    fbalpha2012_cps1:     'FB Alpha 2012 CPS-1',
    fbalpha2012_cps2:     'FB Alpha 2012 CPS-2',
    fbneo:                'FBNeo',
    fceumm:               'FCEUmm',
    freeintv:             'FreeIntv',
    gambatte:             'Gambatte',
    gearcoleco:           'GearColeco',
    genesis_plus_gx:      'Genesis Plus GX',
    handy:                'Handy',
    mame2003:             'MAME 2003',
    mame2003_plus:        'MAME 2003-Plus',
    mednafen_ngp:         'Mednafen NGP',
    mednafen_pce:         'Mednafen PCE',
    mednafen_pcfx:        'Mednafen PC-FX',
    mednafen_psx_hw:      'Mednafen PSX HW',
    mednafen_wswan:       'Mednafen WonderSwan',
    melonds:              'melonDS',
    melondsds:            'melonDS DS',
    mgba:                 'mGBA',
    mupen64plus_next:     'Mupen64Plus-Next',
    nestopia:             'Nestopia',
    opera:                'Opera',
    parallel_n64:         'ParaLLEl N64',
    pcsx_rearmed:         'PCSX ReARMed',
    picodrive:            'PicoDrive',
    ppsspp:               'PPSSPP',
    prosystem:            'ProSystem',
    puae:                 'PUAE',
    smsplus:              'SMS Plus GX',
    snes9x:               'Snes9x',
    stella2014:           'Stella 2014',
    vice_x128:            'VICE x128',
    vice_x64:             'VICE x64',
    vice_x64sc:           'VICE x64sc',
    vice_xpet:            'VICE xpet',
    vice_xplus4:          'VICE xplus4',
    vice_xvic:            'VICE xvic',
    virtualjaguar:        'Virtual Jaguar',
    yabause:              'Yabause',
};

export function getCoreDisplayName(libretroCore: string): string {
    return CORE_DISPLAY_NAMES[libretroCore]
        ?? (libretroCore.charAt(0).toUpperCase() + libretroCore.slice(1));
}

// ─── User's preferred core per system ───────────────────────────────────────

const STORAGE_KEY = 'ra_system_core_pref_v1';

export const getCorePref = (system: string): string | undefined =>
    getStringRecordEntry(STORAGE_KEY, system);

export const setCorePref = (system: string, libretroName: string): void =>
    setStringRecordEntry(STORAGE_KEY, system, libretroName);
