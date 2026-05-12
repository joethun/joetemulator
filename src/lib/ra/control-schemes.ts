interface ButtonDef {
    id: number;
    label: string;
}

const b = (id: number, label: string): ButtonDef => ({ id, label });

const DPAD: ButtonDef[] = [b(4, 'UP'), b(5, 'DOWN'), b(6, 'LEFT'), b(7, 'RIGHT')];

const SCHEMES: Record<string, ButtonDef[]> = {
    gb: [
        b(8, 'A'), b(0, 'B'), b(2, 'SELECT'), b(3, 'START'),
        ...DPAD,
    ],
    snes: [
        b(8, 'A'), b(0, 'B'), b(9, 'X'), b(1, 'Y'),
        b(2, 'SELECT'), b(3, 'START'),
        ...DPAD,
        b(10, 'L'), b(11, 'R'),
    ],
    n64: [
        b(0, 'A'), b(1, 'B'), b(3, 'START'),
        b(4, 'D-PAD UP'), b(5, 'D-PAD DOWN'), b(6, 'D-PAD LEFT'), b(7, 'D-PAD RIGHT'),
        b(10, 'L'), b(11, 'R'), b(12, 'Z'),
        b(19, 'STICK UP'), b(18, 'STICK DOWN'), b(17, 'STICK LEFT'), b(16, 'STICK RIGHT'),
        b(23, 'C-PAD UP'), b(22, 'C-PAD DOWN'), b(21, 'C-PAD LEFT'), b(20, 'C-PAD RIGHT'),
    ],
    gba: [
        b(8, 'A'), b(0, 'B'), b(10, 'L'), b(11, 'R'),
        b(2, 'SELECT'), b(3, 'START'),
        ...DPAD,
    ],
    melonds: [
        b(8, 'A'), b(0, 'B'), b(9, 'X'), b(1, 'Y'),
        b(2, 'SELECT'), b(3, 'START'),
        ...DPAD,
        b(10, 'L'), b(11, 'R'), b(14, 'Microphone'),
    ],
    vb: [
        b(8, 'A'), b(0, 'B'), b(10, 'L'), b(11, 'R'),
        b(2, 'SELECT'), b(3, 'START'),
        b(4, 'LEFT D-PAD UP'), b(5, 'LEFT D-PAD DOWN'), b(6, 'LEFT D-PAD LEFT'), b(7, 'LEFT D-PAD RIGHT'),
        b(19, 'RIGHT D-PAD UP'), b(18, 'RIGHT D-PAD DOWN'), b(17, 'RIGHT D-PAD LEFT'), b(16, 'RIGHT D-PAD RIGHT'),
    ],
    segaMD: [
        b(1, 'A'), b(0, 'B'), b(8, 'C'), b(10, 'X'), b(9, 'Y'), b(11, 'Z'),
        b(3, 'START'), b(2, 'MODE'),
        ...DPAD,
    ],
    segaMS: [
        b(0, 'BUTTON 1 / START'), b(8, 'BUTTON 2'),
        ...DPAD,
    ],
    genesis_plus_gx: [
        b(0, 'BUTTON 1'), b(8, 'BUTTON 2'), b(3, 'START'),
        ...DPAD,
    ],
    segaSaturn: [
        b(1, 'A'), b(0, 'B'), b(8, 'C'), b(9, 'X'), b(10, 'Y'), b(11, 'Z'),
        b(12, 'L'), b(13, 'R'), b(3, 'START'),
        ...DPAD,
    ],
    opera: [
        b(1, 'A'), b(0, 'B'), b(8, 'C'), b(10, 'L'), b(11, 'R'),
        b(2, 'X'), b(3, 'P'),
        ...DPAD,
    ],
    atari2600: [
        b(0, 'FIRE'), b(2, 'SELECT'), b(3, 'RESET'),
        ...DPAD,
        b(10, 'LEFT DIFFICULTY A'), b(12, 'LEFT DIFFICULTY B'),
        b(11, 'RIGHT DIFFICULTY A'), b(13, 'RIGHT DIFFICULTY B'),
        b(14, 'COLOR'), b(15, 'B/W'),
    ],
    atari5200: [
        b(0, 'FIRE'), b(2, 'PAUSE'), b(3, 'RESET'),
        ...DPAD,
        b(8, 'FIRE 2'), b(9, 'START'),
    ],
    atari7800: [
        b(0, 'BUTTON 1'), b(8, 'BUTTON 2'),
        b(2, 'SELECT'), b(3, 'PAUSE'), b(9, 'RESET'),
        ...DPAD,
        b(10, 'LEFT DIFFICULTY'), b(11, 'RIGHT DIFFICULTY'),
    ],
    lynx: [
        b(8, 'A'), b(0, 'B'), b(10, 'OPTION 1'), b(11, 'OPTION 2'),
        b(3, 'START'),
        ...DPAD,
    ],
    jaguar: [
        b(8, 'A'), b(0, 'B'), b(1, 'C'), b(2, 'PAUSE'), b(3, 'OPTION'),
        ...DPAD,
    ],
    pce: [
        b(8, 'I'), b(0, 'II'), b(2, 'SELECT'), b(3, 'RUN'),
        ...DPAD,
    ],
    pcfx: [
        b(8, 'I'), b(0, 'II'), b(9, 'III'), b(1, 'IV'), b(10, 'V'), b(11, 'VI'),
        b(3, 'RUN'), b(2, 'SELECT'),
        b(12, 'MODE1'), b(13, 'MODE2'),
        ...DPAD,
    ],
    ngp: [
        b(0, 'A'), b(8, 'B'), b(3, 'OPTION'),
        ...DPAD,
    ],
    ws: [
        b(8, 'A'), b(0, 'B'), b(3, 'START'),
        b(4, 'X UP'), b(5, 'X DOWN'), b(6, 'X LEFT'), b(7, 'X RIGHT'),
        b(13, 'Y UP'), b(12, 'Y DOWN'), b(10, 'Y LEFT'), b(11, 'Y RIGHT'),
    ],
    coleco: [
        b(8, 'LEFT BUTTON'), b(0, 'RIGHT BUTTON'),
        b(9, '1'), b(1, '2'), b(11, '3'), b(10, '4'),
        b(13, '5'), b(12, '6'), b(15, '7'), b(14, '8'),
        b(2, '*'), b(3, '#'),
        ...DPAD,
    ],
    intellivision: [
        b(0, 'TOP ACTION'), b(8, 'RIGHT ACTION'), b(9, 'LEFT ACTION'),
        b(1, 'NUMBER KEYPAD'), b(11, 'MINI-KEYPAD'), b(10, 'MUTE AUDIO'),
        b(3, '1'), b(2, '9'), b(12, 'CLEAR'), b(13, 'ENTER'),
        b(14, '0'), b(15, 'LAST KEYPAD'),
        ...DPAD,
    ],
    psp: [
        b(9, 'TRIANGLE'), b(1, 'SQUARE'), b(0, 'CROSS'), b(8, 'CIRCLE'),
        b(2, 'SELECT'), b(3, 'START'),
        ...DPAD,
        b(10, 'L'), b(11, 'R'),
        b(19, 'STICK UP'), b(18, 'STICK DOWN'), b(17, 'STICK LEFT'), b(16, 'STICK RIGHT'),
    ],
    psx: [
        b(9, 'TRIANGLE'), b(1, 'SQUARE'), b(0, 'CROSS'), b(8, 'CIRCLE'),
        b(2, 'SELECT'), b(3, 'START'),
        ...DPAD,
        b(10, 'L1'), b(11, 'R1'), b(12, 'L2'), b(13, 'R2'),
        b(19, 'L STICK UP'), b(18, 'L STICK DOWN'), b(17, 'L STICK LEFT'), b(16, 'L STICK RIGHT'),
        b(23, 'R STICK UP'), b(22, 'R STICK DOWN'), b(21, 'R STICK LEFT'), b(20, 'R STICK RIGHT'),
    ],
    default: [
        b(8, 'A'), b(0, 'B'), b(9, 'X'), b(1, 'Y'),
        b(2, 'SELECT'), b(3, 'START'),
        ...DPAD,
        b(10, 'L'), b(11, 'R'), b(12, 'L2'), b(13, 'R2'), b(14, 'L3'), b(15, 'R3'),
        b(16, 'L STICK RIGHT'), b(17, 'L STICK LEFT'), b(18, 'L STICK DOWN'), b(19, 'L STICK UP'),
        b(20, 'R STICK RIGHT'), b(21, 'R STICK LEFT'), b(22, 'R STICK DOWN'), b(23, 'R STICK UP'),
    ],
};

const ALIASES: Record<string, string> = {
    gbc: 'gb',
    nes: 'gb',
    segaCD: 'segaMD',
    sega32x: 'segaMD',
};

export const getButtonsForCore = (core: string): ButtonDef[] =>
    SCHEMES[ALIASES[core] ?? core] ?? SCHEMES.default;
