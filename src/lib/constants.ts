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
    "ColecoVision": "coleco", "SNK Neo Geo Pocket": "ngp", "Bandai WonderSwan": "ws"
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