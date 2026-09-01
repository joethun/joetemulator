interface ButtonDef {
    id: number;
    label: string;
    /** Overrides the default ID-range grouping in the controls UI. */
    group?: string;
}

const b = (id: number, label: string, group?: string): ButtonDef => ({ id, label, group });

/**
 * Analog retropad ids. Each stick axis direction is its own id carrying a
 * magnitude — see ANALOG_BASE / RetroAnalog in input.ts.
 */
const L_RIGHT = 16, L_LEFT = 17, L_DOWN = 18, L_UP = 19;
const R_RIGHT = 20, R_LEFT = 21, R_DOWN = 22, R_UP = 23;

const DPAD: ButtonDef[] = [
    b(4, 'D-PAD UP'), b(5, 'D-PAD DOWN'), b(6, 'D-PAD LEFT'), b(7, 'D-PAD RIGHT'),
];

/** D-pad for cores that describe it as a bare direction rather than a pad. */
const DIRECTIONS: ButtonDef[] = [
    b(4, 'UP'), b(5, 'DOWN'), b(6, 'LEFT'), b(7, 'RIGHT'),
];

const L_STICK: ButtonDef[] = [
    b(L_UP, 'L STICK UP'), b(L_DOWN, 'L STICK DOWN'),
    b(L_LEFT, 'L STICK LEFT'), b(L_RIGHT, 'L STICK RIGHT'),
];

const R_STICK: ButtonDef[] = [
    b(R_UP, 'R STICK UP'), b(R_DOWN, 'R STICK DOWN'),
    b(R_LEFT, 'R STICK LEFT'), b(R_RIGHT, 'R STICK RIGHT'),
];

// FBNeo and the FB Alpha CPS cores build descriptors per game, but all of them
// use the classic six-button fighter panel: punches on the top row (Y/X/L),
// kicks on the bottom (B/A/R). Numbered here in panel order, which is how the
// CPS cores label them (Weak/Medium/Strong Punch then Kick).
const FBNEO: ButtonDef[] = [
    b(1, 'BUTTON 1'), b(9, 'BUTTON 2'), b(10, 'BUTTON 3', 'Buttons'),
    b(0, 'BUTTON 4'), b(8, 'BUTTON 5'), b(11, 'BUTTON 6', 'Buttons'),
    ...DPAD,
    b(3, 'START'),
    b(2, 'INSERT COIN', 'System'),
];

// MAME numbers the same panel differently from FBNeo, and exposes ten buttons.
const MAME: ButtonDef[] = [
    b(0, 'BUTTON 1'), b(1, 'BUTTON 2'), b(9, 'BUTTON 3'),
    b(8, 'BUTTON 4'), b(10, 'BUTTON 5', 'Buttons'), b(11, 'BUTTON 6', 'Buttons'),
    b(4, 'JOYSTICK UP'), b(5, 'JOYSTICK DOWN'),
    b(6, 'JOYSTICK LEFT'), b(7, 'JOYSTICK RIGHT'),
    b(3, 'START'),
    b(2, 'INSERT COIN', 'System'),
    b(12, 'BUTTON 7', 'Other'), b(13, 'BUTTON 8', 'Other'),
    b(14, 'BUTTON 9', 'Other'), b(15, 'BUTTON 10', 'Other'),
];

// Full-retropad cores (computers) — every id is a plain pad button.
const FULL_PAD: ButtonDef[] = [
    b(8, 'A'), b(0, 'B'), b(9, 'X'), b(1, 'Y'),
    b(2, 'SELECT'), b(3, 'START'),
    ...DIRECTIONS,
    b(10, 'L'), b(11, 'R'), b(12, 'L2'), b(13, 'R2'), b(14, 'L3'), b(15, 'R3'),
    ...L_STICK, ...R_STICK,
];

/**
 * Buttons each system exposes, with the labels and retropad ids the libretro
 * core actually uses. Extracted from the `retro_input_descriptor` tables in the
 * shipped core binaries (public/cores), so they match what RetroArch shows for
 * the same core — several of these are not the ids you would guess from the
 * button's name (N64 puts L Shoulder on SELECT, Saturn puts C on R, and so on).
 */
const SCHEMES: Record<string, ButtonDef[]> = {
    gb: [
        b(8, 'A'), b(0, 'B'),
        b(2, 'SELECT'), b(3, 'START'),
        ...DPAD,
        b(9, 'TURBO A', 'Other'), b(1, 'TURBO B', 'Other'),
        b(10, 'PREV. PALETTE', 'Other'), b(11, 'NEXT PALETTE', 'Other'),
        b(13, 'CORE FAST-FORWARD', 'Other'),
    ],
    nes: [
        b(8, 'A'), b(0, 'B'),
        b(2, 'SELECT'), b(3, 'START'),
        ...DPAD,
        b(9, 'TURBO A', 'Other'), b(1, 'TURBO B', 'Other'),
        b(14, 'A + B', 'Other'), b(15, 'TURBO A + B', 'Other'),
        b(10, '(FDS) DISK SIDE CHANGE', 'Other'), b(11, '(FDS) INSERT/EJECT DISK', 'Other'),
        b(12, 'SWITCH PALETTE', 'Other'), b(13, '(VS SYSTEM) INSERT COIN', 'Other'),
    ],
    snes: [
        b(8, 'A'), b(0, 'B'), b(9, 'X'), b(1, 'Y'),
        b(2, 'SELECT'), b(3, 'START'),
        ...DPAD,
        b(10, 'L'), b(11, 'R'),
    ],
    n64: [
        b(0, 'A'), b(1, 'B'),
        ...DPAD,
        b(9, 'C-UP', 'C Buttons'), b(8, 'C-DOWN', 'C Buttons'),
        b(10, 'C-LEFT', 'C Buttons'), b(11, 'C-RIGHT', 'C Buttons'),
        b(2, 'L SHOULDER', 'Shoulder'), b(13, 'R SHOULDER', 'Shoulder'),
        b(12, 'Z TRIGGER', 'Shoulder'),
        b(3, 'START'),
        b(L_UP, 'CONTROL STICK UP'), b(L_DOWN, 'CONTROL STICK DOWN'),
        b(L_LEFT, 'CONTROL STICK LEFT'), b(L_RIGHT, 'CONTROL STICK RIGHT'),
        b(R_UP, 'C BUTTONS UP'), b(R_DOWN, 'C BUTTONS DOWN'),
        b(R_LEFT, 'C BUTTONS LEFT'), b(R_RIGHT, 'C BUTTONS RIGHT'),
    ],
    gba: [
        b(8, 'A'), b(0, 'B'),
        b(2, 'SELECT'), b(3, 'START'),
        ...DIRECTIONS,
        b(10, 'L'), b(11, 'R'),
        b(9, 'TURBO A', 'Other'), b(1, 'TURBO B', 'Other'),
        b(12, 'TURBO L', 'Other'), b(13, 'TURBO R', 'Other'),
        b(15, 'BRIGHTEN SOLAR SENSOR', 'Other'), b(14, 'DARKEN SOLAR SENSOR', 'Other'),
    ],
    melonds: [
        b(8, 'A'), b(0, 'B'), b(9, 'X'), b(1, 'Y'),
        b(2, 'SELECT'), b(3, 'START'),
        ...DIRECTIONS,
        b(10, 'L'), b(11, 'R'),
        b(12, 'MICROPHONE', 'Other'), b(13, 'NEXT SCREEN LAYOUT', 'Other'),
        b(14, 'CLOSE LID', 'Other'), b(15, 'TOUCH JOYSTICK', 'Other'),
        b(R_UP, 'TOUCH JOYSTICK UP'), b(R_DOWN, 'TOUCH JOYSTICK DOWN'),
        b(R_LEFT, 'TOUCH JOYSTICK LEFT'), b(R_RIGHT, 'TOUCH JOYSTICK RIGHT'),
    ],
    vb: [
        b(8, 'A'), b(0, 'B'),
        b(2, 'SELECT'), b(3, 'START'),
        b(4, 'LEFT D-PAD UP'), b(5, 'LEFT D-PAD DOWN'),
        b(6, 'LEFT D-PAD LEFT'), b(7, 'LEFT D-PAD RIGHT'),
        b(12, 'RIGHT D-PAD UP', 'Right D-Pad'), b(14, 'RIGHT D-PAD DOWN', 'Right D-Pad'),
        b(13, 'RIGHT D-PAD LEFT', 'Right D-Pad'), b(15, 'RIGHT D-PAD RIGHT', 'Right D-Pad'),
        b(10, 'L'), b(11, 'R'),
        b(9, 'LOW-BATTERY TOGGLE', 'Other'),
        b(R_UP, 'RIGHT D-PAD UP (STICK)'), b(R_DOWN, 'RIGHT D-PAD DOWN (STICK)'),
        b(R_LEFT, 'RIGHT D-PAD LEFT (STICK)'), b(R_RIGHT, 'RIGHT D-PAD RIGHT (STICK)'),
    ],
    segaMD: [
        b(1, 'A'), b(0, 'B'), b(8, 'C'),
        b(10, 'X', 'Buttons'), b(9, 'Y'), b(11, 'Z', 'Buttons'),
        b(3, 'START'), b(2, 'MODE'),
        ...DPAD,
    ],
    // smsplus also emulates ColecoVision and declares its keypad on ids 1/2/9-15;
    // those are omitted here since ColecoVision runs on gearcoleco in this app.
    segaMS: [
        b(0, 'BUTTON 1'), b(8, 'BUTTON 2'),
        b(3, 'START / PAUSE'),
        ...DPAD,
    ],
    // Game Gear. One core serves Genesis/SMS/GG so it declares the full six-button
    // Genesis set, but Game Gear hardware only has these three.
    genesis_plus_gx: [
        b(0, 'BUTTON 1'), b(8, 'BUTTON 2'), b(3, 'START'),
        ...DPAD,
    ],
    segaSaturn: [
        b(0, 'A'), b(8, 'B'), b(11, 'C', 'Buttons'),
        b(1, 'X'), b(9, 'Y'), b(10, 'Z', 'Buttons'),
        b(12, 'L'), b(13, 'R'),
        b(3, 'START'),
        ...DPAD,
    ],
    opera: [
        b(1, 'A'), b(0, 'B'), b(8, 'C'),
        b(10, 'L'), b(11, 'R'),
        b(2, 'X (STOP)'), b(3, 'P (PLAY/PAUSE)'),
        ...DPAD,
        b(9, 'P (PLAY/PAUSE) ALT', 'Other'),
    ],
    atari2600: [
        b(0, 'FIRE'), b(8, 'P1 FIRE (PADDLE)'), b(1, 'PADDLE FIRE'),
        b(2, 'SELECT'), b(3, 'RESET'),
        ...DIRECTIONS,
        b(10, 'LEFT DIFFICULTY A', 'Console'), b(12, 'LEFT DIFFICULTY B', 'Console'),
        b(11, 'RIGHT DIFFICULTY A', 'Console'), b(13, 'RIGHT DIFFICULTY B', 'Console'),
        b(14, 'COLOR', 'Console'), b(15, 'BLACK/WHITE', 'Console'),
        b(L_RIGHT, 'PADDLE RIGHT'), b(L_LEFT, 'PADDLE LEFT'),
        b(L_DOWN, 'P2 PADDLE RIGHT'), b(L_UP, 'P2 PADDLE LEFT'),
    ],
    atari5200: [
        b(8, 'FIRE 1 / OSK SELECT'), b(0, 'FIRE 2'),
        b(2, 'PAUSE'), b(3, 'START'),
        b(4, 'JOYSTICK UP'), b(5, 'JOYSTICK DOWN'),
        b(6, 'JOYSTICK LEFT'), b(7, 'JOYSTICK RIGHT'),
        b(10, 'SHOW/HIDE OSK', 'Keypad'),
        b(1, 'NUMPAD *', 'Keypad'), b(9, 'NUMPAD #', 'Keypad'),
        b(11, 'NUMPAD 0', 'Keypad'), b(13, 'NUMPAD 1', 'Keypad'),
        b(12, 'NUMPAD 3', 'Keypad'), b(15, 'NUMPAD 5', 'Keypad'),
        b(14, 'NUMPAD 7', 'Keypad'),
        b(L_UP, 'JOYSTICK UP (ANALOG)'), b(L_DOWN, 'JOYSTICK DOWN (ANALOG)'),
        b(L_LEFT, 'JOYSTICK LEFT (ANALOG)'), b(L_RIGHT, 'JOYSTICK RIGHT (ANALOG)'),
        b(R_UP, 'NUMPAD [1-9] UP'), b(R_DOWN, 'NUMPAD [1-9] DOWN'),
        b(R_LEFT, 'NUMPAD [1-9] LEFT'), b(R_RIGHT, 'NUMPAD [1-9] RIGHT'),
    ],
    atari7800: [
        b(0, 'BUTTON 1'), b(8, 'BUTTON 2'),
        b(2, 'CONSOLE SELECT'), b(3, 'CONSOLE PAUSE'), b(9, 'CONSOLE RESET', 'System'),
        ...DIRECTIONS,
        b(10, 'LEFT DIFFICULTY', 'Console'), b(11, 'RIGHT DIFFICULTY', 'Console'),
        b(R_UP, '(DUAL STICK) P2 UP'), b(R_DOWN, '(DUAL STICK) P2 DOWN'),
        b(R_LEFT, '(DUAL STICK) P2 LEFT'), b(R_RIGHT, '(DUAL STICK) P2 RIGHT'),
    ],
    lynx: [
        b(8, 'A'), b(0, 'B'),
        b(10, 'OPTION 1', 'Buttons'), b(11, 'OPTION 2', 'Buttons'),
        b(3, 'PAUSE'), b(2, 'ROTATE SCREEN'),
        ...DPAD,
    ],
    jaguar: [
        b(8, 'A'), b(0, 'B'), b(1, 'C'),
        b(2, 'PAUSE'), b(3, 'OPTION'),
        ...DPAD,
        b(9, 'NUMPAD 0', 'Keypad'), b(10, 'NUMPAD 1', 'Keypad'),
        b(11, 'NUMPAD 2', 'Keypad'), b(12, 'NUMPAD 3', 'Keypad'),
        b(13, 'NUMPAD 4', 'Keypad'), b(14, 'NUMPAD 5', 'Keypad'),
        b(15, 'NUMPAD 6', 'Keypad'),
        ...L_STICK, ...R_STICK,
    ],
    pce: [
        b(8, 'I'), b(0, 'II'), b(1, 'III'), b(9, 'IV'),
        b(10, 'V', 'Buttons'), b(11, 'VI', 'Buttons'),
        b(2, 'SELECT'), b(3, 'RUN'),
        ...DPAD,
        b(12, 'MODE SWITCH', 'Other'),
    ],
    pcfx: [
        b(8, 'I'), b(0, 'II'), b(9, 'III'), b(1, 'IV'),
        b(10, 'V', 'Buttons'), b(11, 'VI', 'Buttons'),
        b(2, 'SELECT'), b(3, 'RUN'),
        ...DPAD,
        b(12, 'MODE 1 (SWITCH)', 'Other'), b(13, 'MODE 2 (SWITCH)', 'Other'),
    ],
    ngp: [
        b(0, 'A'), b(8, 'B'), b(3, 'OPTION'),
        ...DPAD,
    ],
    ws: [
        b(8, 'A'), b(0, 'B'), b(3, 'START'),
        b(4, 'X CURSOR UP'), b(5, 'X CURSOR DOWN'),
        b(6, 'X CURSOR LEFT'), b(7, 'X CURSOR RIGHT'),
        b(13, 'Y CURSOR UP', 'Y Cursor'), b(12, 'Y CURSOR DOWN', 'Y Cursor'),
        b(10, 'Y CURSOR LEFT', 'Y Cursor'), b(11, 'Y CURSOR RIGHT', 'Y Cursor'),
        b(2, 'ROTATE SCREEN', 'Other'),
    ],
    coleco: [
        b(0, 'YELLOW (LEFT)'), b(8, 'RED (RIGHT)'),
        b(4, 'JOYSTICK UP'), b(5, 'JOYSTICK DOWN'),
        b(6, 'JOYSTICK LEFT'), b(7, 'JOYSTICK RIGHT'),
        b(1, 'KEYPAD 1', 'Keypad'), b(9, 'KEYPAD 2', 'Keypad'),
        b(10, 'KEYPAD 3', 'Keypad'), b(11, 'KEYPAD 4', 'Keypad'),
        b(12, 'KEYPAD 5', 'Keypad'), b(13, 'KEYPAD 6', 'Keypad'),
        b(14, 'KEYPAD 7', 'Keypad'), b(15, 'KEYPAD 8', 'Keypad'),
        b(3, 'KEYPAD *', 'Keypad'), b(2, 'KEYPAD #', 'Keypad'),
        // GearColeco reads these four off the stick axes rather than a button, so
        // both directions of each axis are offered — bind whichever registers.
        b(L_RIGHT, 'KEYPAD 0 (STICK +)'), b(L_LEFT, 'KEYPAD 0 (STICK −)'),
        b(L_DOWN, 'KEYPAD 9 (STICK +)'), b(L_UP, 'KEYPAD 9 (STICK −)'),
        b(R_RIGHT, 'BLUE (STICK +)'), b(R_LEFT, 'BLUE (STICK −)'),
        b(R_DOWN, 'PURPLE (STICK +)'), b(R_UP, 'PURPLE (STICK −)'),
    ],
    intellivision: [
        b(1, 'TOP ACTION BUTTON'), b(0, 'RIGHT ACTION BUTTON'), b(8, 'LEFT ACTION BUTTON'),
        b(4, 'DISC UP'), b(5, 'DISC DOWN'), b(6, 'DISC LEFT'), b(7, 'DISC RIGHT'),
        b(3, 'CONSOLE PAUSE'), b(2, 'SWAP LEFT/RIGHT CONTROLLERS'),
        b(10, 'SHOW KEYPAD', 'Keypad'), b(11, 'SHOW KEYPAD (ALT)', 'Keypad'),
        b(9, 'LAST SELECTED KEYPAD BUTTON', 'Keypad'),
        b(12, 'KEYPAD CLEAR', 'Keypad'), b(13, 'KEYPAD ENTER', 'Keypad'),
        b(14, 'KEYPAD 0', 'Keypad'), b(15, 'KEYPAD 5', 'Keypad'),
        b(R_UP, 'KEYPAD [1-9] UP'), b(R_DOWN, 'KEYPAD [1-9] DOWN'),
        b(R_LEFT, 'KEYPAD [1-9] LEFT'), b(R_RIGHT, 'KEYPAD [1-9] RIGHT'),
    ],
    psx: [
        b(9, 'TRIANGLE'), b(1, 'SQUARE'), b(0, 'CROSS'), b(8, 'CIRCLE'),
        b(2, 'SELECT'), b(3, 'START'),
        ...DPAD,
        b(10, 'L1'), b(11, 'R1'), b(12, 'L2'), b(13, 'R2'), b(14, 'L3'), b(15, 'R3'),
        b(L_UP, 'L STICK UP'), b(L_DOWN, 'L STICK DOWN'),
        b(L_LEFT, 'L STICK LEFT'), b(L_RIGHT, 'L STICK RIGHT'),
        b(R_UP, 'R STICK UP'), b(R_DOWN, 'R STICK DOWN'),
        b(R_LEFT, 'R STICK LEFT'), b(R_RIGHT, 'R STICK RIGHT'),
    ],
    psp: [
        b(9, 'TRIANGLE'), b(1, 'SQUARE'), b(0, 'CROSS'), b(8, 'CIRCLE'),
        b(2, 'SELECT'), b(3, 'START'),
        ...DPAD,
        b(10, 'L'), b(11, 'R'),
        b(L_UP, 'ANALOG UP'), b(L_DOWN, 'ANALOG DOWN'),
        b(L_LEFT, 'ANALOG LEFT'), b(L_RIGHT, 'ANALOG RIGHT'),
        ...R_STICK,
    ],
    amiga: [
        b(0, 'B / FIRE / RED'), b(8, 'A / 2ND FIRE / BLUE'),
        b(1, 'Y / GREEN'), b(9, 'X / YELLOW'),
        b(2, 'SELECT'), b(3, 'START / PLAY'),
        ...DIRECTIONS,
        b(10, 'L / REWIND'), b(11, 'R / FORWARD'),
        b(12, 'L2'), b(13, 'R2'), b(14, 'L3'), b(15, 'R3'),
        ...L_STICK, ...R_STICK,
    ],
    vice_x64: FULL_PAD,
    arcade: FBNEO,
    mame: MAME,
    dosbox_pure: FULL_PAD,
    default: FULL_PAD,
};

const ALIASES: Record<string, string> = {
    gbc: 'gb',
    segaCD: 'segaMD',
    sega32x: 'segaMD',
    mame2003_plus: 'mame',
    vice_x128: 'vice_x64',
    vice_xpet: 'vice_x64',
    vice_xvic: 'vice_x64',
    vice_xplus4: 'vice_x64',
};

/**
 * Alternate cores whose layout differs from the system's default core, keyed
 * `system:libretroCore`. Cores not listed here match the system scheme above.
 */
const CORE_OVERRIDES: Record<string, ButtonDef[]> = {
    'nes:nestopia': [
        b(8, 'A'), b(0, 'B'),
        b(2, 'SELECT'), b(3, 'START'),
        ...DPAD,
        b(9, 'TURBO A', 'Other'), b(1, 'TURBO B', 'Other'),
        b(10, '(FDS) DISK SIDE CHANGE', 'Other'), b(11, '(FDS) EJECT DISK', 'Other'),
        b(12, '(VS SYSTEM) COIN 1', 'Other'), b(13, '(VS SYSTEM) COIN 2', 'Other'),
        b(14, '(FAMICOM) MICROPHONE', 'Other'),
    ],
    'melonds:melonds': [
        b(8, 'A'), b(0, 'B'), b(9, 'X'), b(1, 'Y'),
        b(2, 'SELECT'), b(3, 'START'),
        ...DIRECTIONS,
        b(10, 'L'), b(11, 'R'),
        b(12, 'MICROPHONE', 'Other'), b(13, 'SWAP SCREENS', 'Other'),
        b(14, 'CLOSE LID', 'Other'), b(15, 'TOUCH JOYSTICK', 'Other'),
        b(R_UP, 'TOUCH JOYSTICK UP'), b(R_DOWN, 'TOUCH JOYSTICK DOWN'),
        b(R_LEFT, 'TOUCH JOYSTICK LEFT'), b(R_RIGHT, 'TOUCH JOYSTICK RIGHT'),
    ],
    'melonds:desmume': [
        b(8, 'A'), b(0, 'B'), b(9, 'X'), b(1, 'Y'),
        b(2, 'SELECT'), b(3, 'START'),
        ...DIRECTIONS,
        b(10, 'L'), b(11, 'R'),
        b(12, 'LID CLOSE/OPEN', 'Other'), b(13, 'TAP STYLUS', 'Other'),
        b(14, 'MICROPHONE', 'Other'), b(15, 'QUICK SCREEN SWITCH', 'Other'),
    ],
};
CORE_OVERRIDES['melonds:desmume2015'] = CORE_OVERRIDES['melonds:desmume'];

export function getButtonsForCore(system: string, libretroCore?: string): ButtonDef[] {
    const override = libretroCore && CORE_OVERRIDES[`${system}:${libretroCore}`];
    if (override) return override;
    return SCHEMES[ALIASES[system] ?? system] ?? SCHEMES.default;
}

/**
 * Retropad ids the given core actually uses. Bindings driving any other id are
 * dropped before reaching the core — otherwise the default mapping of e.g.
 * Tab/KeyR/gamepad-buttons-6-7 → L2/R2 (retropad 12/13) silently activates
 * core-specific functions hidden behind those slots, like mGBA's Turbo A/B.
 */
export const getRetroIdsForCore = (system: string, libretroCore?: string): ReadonlySet<number> =>
    new Set(getButtonsForCore(system, libretroCore).map(button => button.id));
