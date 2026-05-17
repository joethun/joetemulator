export const SYSTEM_PICKER: Record<string, Record<string, string>> = {
  "Nintendo": {
    "NES": "nes", "Game Boy": "gb", "Game Boy Color": "gbc",
    "Game Boy Advance": "gba", "SNES": "snes", "Virtual Boy": "vb",
    "N64": "n64", "DS": "melonds",
  },
  "Sega": {
    "Master System": "segaMS", "Genesis": "segaMD",
    "Game Gear": "genesis_plus_gx", "CD": "segaCD", "32X": "sega32x", "Saturn": "segaSaturn",
  },
  "Sony": { "PS1": "psx", "PSP": "psp" },
  "Atari": {
    "2600": "atari2600", "5200": "atari5200", "7800": "atari7800",
    "Lynx": "lynx", "Jaguar": "jaguar",
  },
  "Commodore": {
    "Amiga": "amiga", "64": "vice_x64", "128": "vice_x128",
    "PET": "vice_xpet", "VIC-20": "vice_xvic", "Plus/4": "vice_xplus4",
  },
  "Arcade": { "FBNeo": "arcade", "M.A.M.E": "mame2003_plus" },
  "NEC": { "TurboGrafx-16": "pce", "PC-FX": "pcfx" },
  "Other": {
    "Panasonic 3DO": "opera", "Microsoft DOS": "dosbox_pure",
    "ColecoVision": "coleco", "Intellivision": "intellivision",
    "SNK Neo Geo Pocket": "ngp", "Bandai WonderSwan": "ws"
  }
};

const coreToNameMap = new Map<string, string>();
const coreToCategoryMap = new Map<string, string>();

for (const [category, systems] of Object.entries(SYSTEM_PICKER)) {
  for (const [name, core] of Object.entries(systems)) {
    coreToNameMap.set(core, name);
    coreToCategoryMap.set(core, category);
  }
}

export const getSystemNameByCore = (core: string): string =>
  coreToNameMap.get(core) || 'Unknown System';

export const getSystemCategory = (core?: string): string =>
  (core && coreToCategoryMap.get(core)) || 'Other';

const SYSTEM_ASPECT_RATIOS: Record<string, number> = {
  // Nintendo
  "NES": 0.700,
  "Game Boy": 1.0,
  "Game Boy Color": 1.0,
  "Game Boy Advance": 1.0,
  "SNES": 1.434,
  "Virtual Boy": 1.008,
  "N64": 1.434,
  "DS": 1.114,

  // Sega
  "Master System": 0.706,
  "Genesis": 0.700,
  "Game Gear": 0.711,
  "CD": 0.592,
  "32X": 0.725,
  "Saturn": 0.623,

  // Sony
  "PS1": 1.0,
  "PSP": 0.579,

  // Atari & PC & Arcade
  "2600": 0.735,
  "5200": 0.732,
  "7800": 0.714,
  "Lynx": 1.118,
  "Jaguar": 0.717,
  "Amiga": 0.833,
  "FBNeo": 0.753,
  "M.A.M.E": 0.770,
  "TurboGrafx-16": 1.0,
  "Microsoft DOS": 0.800,
  "ColecoVision": 0.743,
  "Intellivision": 0.722,
  "SNK Neo Geo Pocket": 0.871,
  "Bandai WonderSwan": 0.804
};

export const getSystemAspectRatio = (systemName?: string): number =>
  (systemName && SYSTEM_ASPECT_RATIOS[systemName]) || 0.8;

// Shared red used for destructive actions (delete/exit). Not themed by design.
export const DANGER_BG = 'rgba(239,68,68,0.15)';
export const DANGER_FG = 'rgb(248,113,113)';

// Standard panel/card drop shadow vs. the heavier modal shadow.
export const SHADOW_CARD = '0 4px 12px rgba(0,0,0,0.3)';
export const SHADOW_MODAL = '0 20px 60px rgba(0,0,0,0.7)';

// Border-radius rule: h-8 small chips/value buttons use rounded-lg;
// h-12+ controls use rounded-xl; modals use rounded-2xl.