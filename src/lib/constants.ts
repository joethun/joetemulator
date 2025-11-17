export const FILE_EXTENSIONS: Record<string, string> = {
  fds: "nes",
  nes: "nes",
  unif: "nes",
  unf: "nes",
  gb: "gb",
  gbc: "gbc",
  gba: "gba",
  smc: "snes",
  sfc: "snes",
  swc: "snes",
  vb: "vb",
  vboy: "vb",
  z64: "n64",
  n64: "n64",
  nds: "nds",
  sms: "segaMS",
  md: "segaMD",
  gen: "segaMD",
  smd: "segaMD",
  gg: "segaGG",
  "32x": "sega32x",
  cso: "psp",
  pbp: "psp",
  a26: "atari2600",
  a52: "atari5200",
  a78: "atari7800",
  lnx: "lynx",
  j64: "jaguar",
  jag: "jaguar",
  d64: "vice_x64",
  t64: "vice_x64",
  tap: "vice_x64",
  crt: "vice_x64",
  col: "coleco",
  cv: "coleco",
  pce: "pce",
  ngp: "ngp",
  ngc: "ngp",
  ws: "ws",
  wsc: "ws"
};

export const SYSTEM_PICKER: Record<string, Record<string, string>> = {
  "Nintendo": {
    "NES": "nes",
    "Game Boy": "gb",
    "Game Boy Color": "gbc",
    "Game Boy Advance": "gba",
    "SNES": "snes",
    "Virtual Boy": "vb",
    "N64": "n64",
    "DS": "nds",
  },
  "Sega": {
    "Master System": "segaMS",
    "Genesis/Mega Drive": "segaMD",
    "Game Gear": "segaGG",
    "CD": "segaCD",
    "32X": "sega32x",
    "Saturn": "segaSaturn",
  },
  "Sony": {
    "PS1": "psx",
    "PSP": "psp",
  },
  "Atari": {
    "2600": "atari2600",
    "5200": "atari5200",
    "7800": "atari7800",
    "Lynx": "lynx",
    "Jaguar": "jaguar",
  },
  "Other": {
    "Panasonic 3DO": "opera",
    "Arcade (FBNeo)": "arcade",
    "Arcade (M.A.M.E)": "mame2003_plus",
    "Microsoft DOS": "dosbox_pure",
    "Commodore PET": "vice_xpet",
    "Commodore VIC-20": "vice_xvic",
    "Commodore Amiga": "amiga",
    "Commodore 64": "vice_x64",
    "Commodore 128": "vice_x128",
    "Commodore Plus/4": "vice_xplus4",
    "ColecoVision": "coleco",
    "NEC TurboGrafx-16": "pce",
    "NEC PC-FX": "pcfx",
    "SNK Neo Geo Pocket": "ngp",
    "Bandai WonderSwan": "ws"
  }
};

export function getSystemNameByCore(core: string): string {
  for (const category of Object.values(SYSTEM_PICKER)) {
    for (const [name, systemCore] of Object.entries(category)) {
      if (systemCore === core) {
        return name;
      }
    }
  }
  return 'Unknown System';
}
