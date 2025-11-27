// file extension to core mapping
export const FILE_EXTENSIONS: Record<string, string> = {
  fds: "nes", nes: "nes", unif: "nes", unf: "nes",
  gb: "gb", gbc: "gbc", gba: "gba",
  smc: "snes", sfc: "snes", swc: "snes",
  vb: "vb", vboy: "vb", z64: "n64", n64: "n64",
  nds: "nds", sms: "segaMS", md: "segaMD", gen: "segaMD", smd: "segaMD",
  gg: "segaGG", "32x": "sega32x", cso: "psp", pbp: "psp",
  a26: "atari2600", a52: "atari5200", a78: "atari7800",
  lnx: "lynx", j64: "jaguar", jag: "jaguar",
  d64: "vice_x64", t64: "vice_x64", tap: "vice_x64", crt: "vice_x64",
  col: "coleco", cv: "coleco", pce: "pce", ngp: "ngp", ngc: "ngp",
  ws: "ws", wsc: "ws"
};

// system categories and configurations
export const SYSTEM_PICKER: Record<string, Record<string, string>> = {
  "Nintendo": {
    "NES": "nes", "Game Boy": "gb", "Game Boy Color": "gbc",
    "Game Boy Advance": "gba", "SNES": "snes", "Virtual Boy": "vb",
    "N64": "n64", "DS": "nds",
  },
  "Sega": {
    "Master System": "segaMS", "Genesis": "segaMD",
    "Game Gear": "segaGG", "CD": "segaCD", "32X": "sega32x", "Saturn": "segaSaturn",
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

// core to display name mapping
export const SYSTEM_DISPLAY_NAMES: Record<string, string> = {
  nes: 'NES', gb: 'GB', gbc: 'GBC', gba: 'GBA', snes: 'SNES', vb: 'VB', n64: 'N64',
  nds: 'DS', segaMS: 'MS', segaMD: 'MD', segaGG: 'GG', segaCD: 'CD',
  sega32x: '32X', segaSaturn: 'Saturn', psx: 'PS1', psp: 'PSP',
  atari2600: '2600', atari5200: '5200', atari7800: '7800',
  lynx: 'Lynx', jaguar: 'Jaguar', opera: '3DO', arcade: 'Arcade',
  mame2003_plus: 'MAME', dosbox_pure: 'DOS', vice_xpet: 'PET',
  vice_xvic: 'VIC20', amiga: 'Amiga', vice_x64: 'C64', vice_x128: 'C128',
  vice_xplus4: 'Plus/4', coleco: 'Coleco', pce: 'TG16', pcfx: 'PC-FX',
  ngp: 'NGP', ws: 'WS',
};

// lookup maps for performance
const coreToNameMap = new Map<string, string>();
const coreToCategoryMap = new Map<string, string>();

// populate lookup maps on init
for (const [category, systems] of Object.entries(SYSTEM_PICKER)) {
  for (const [name, core] of Object.entries(systems)) {
    coreToNameMap.set(core, name);
    coreToCategoryMap.set(core, category);
  }
}

// convert core to system name
export function getSystemNameByCore(core: string): string {
  return coreToNameMap.get(core) || 'Unknown System';
}

// get manufacturer category from core
export function getSystemCategory(core?: string): string {
  return core && coreToCategoryMap.get(core) || 'Other';
}