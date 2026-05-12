import type { GameController } from '@/lib/ra/game';

export const RetroPad = {
    B: 0, Y: 1, SELECT: 2, START: 3,
    UP: 4, DOWN: 5, LEFT: 6, RIGHT: 7,
    A: 8, X: 9, L: 10, R: 11, L2: 12, R2: 13, L3: 14, R3: 15,
} as const;

export const NUM_PLAYERS = 4;
const NUM_BUTTONS = 16;

export type KeyMap = Record<string, { player: number; button: number }>;

export const DEFAULT_KEYMAP: KeyMap = {
    ArrowUp:    { player: 0, button: RetroPad.UP },
    ArrowDown:  { player: 0, button: RetroPad.DOWN },
    ArrowLeft:  { player: 0, button: RetroPad.LEFT },
    ArrowRight: { player: 0, button: RetroPad.RIGHT },
    KeyX:       { player: 0, button: RetroPad.B },
    KeyZ:       { player: 0, button: RetroPad.A },
    KeyS:       { player: 0, button: RetroPad.Y },
    KeyA:       { player: 0, button: RetroPad.X },
    KeyQ:       { player: 0, button: RetroPad.L },
    KeyE:       { player: 0, button: RetroPad.R },
    Tab:        { player: 0, button: RetroPad.L2 },
    KeyR:       { player: 0, button: RetroPad.R2 },
    Enter:      { player: 0, button: RetroPad.START },
    KeyV:       { player: 0, button: RetroPad.SELECT },
};

/** retropad button id → list of physical gamepad button indices that trigger it. */
export type GamepadRetroMap = Record<number, number[]>;

/** Default mapping: each physical button drives one retropad button. */
export const DEFAULT_GAMEPAD_MAP: GamepadRetroMap = {
    [RetroPad.B]:      [0],
    [RetroPad.A]:      [1],
    [RetroPad.Y]:      [2],
    [RetroPad.X]:      [3],
    [RetroPad.L]:      [4],
    [RetroPad.R]:      [5],
    [RetroPad.L2]:     [6],
    [RetroPad.R2]:     [7],
    [RetroPad.SELECT]: [8],
    [RetroPad.START]:  [9],
    [RetroPad.L3]:     [10],
    [RetroPad.R3]:     [11],
    [RetroPad.UP]:     [12],
    [RetroPad.DOWN]:   [13],
    [RetroPad.LEFT]:   [14],
    [RetroPad.RIGHT]:  [15],
};

const DEFAULT_GAMEPAD_BY_PLAYER: Record<number, GamepadRetroMap> = Object.fromEntries(
    Array.from({ length: NUM_PLAYERS }, (_, p) => [p, DEFAULT_GAMEPAD_MAP]),
);

export interface InputBindings {
    keyMap: KeyMap;
    gamepadMap?: Record<number, GamepadRetroMap>;
    gamepadAssignment?: Record<number, number>;
    fastForwardKey?: string;
    saveStateKey?: string;
    loadStateKey?: string;
    pauseKey?: string;
    fastForwardGamepad?: number;
    saveStateGamepad?: number;
    loadStateGamepad?: number;
    pauseGamepad?: number;
}

export const DEFAULT_BINDINGS: Required<InputBindings> = {
    keyMap: DEFAULT_KEYMAP,
    gamepadMap: DEFAULT_GAMEPAD_BY_PLAYER,
    gamepadAssignment: {},
    fastForwardKey: '',
    saveStateKey: 'F1',
    loadStateKey: 'F2',
    pauseKey: 'Escape',
    fastForwardGamepad: -1,
    saveStateGamepad: -1,
    loadStateGamepad: -1,
    pauseGamepad: -1,
};

export interface InputHandlers {
    onSaveState?: () => void;
    onLoadState?: () => void;
    onPause?: () => void;
}

const AXIS_DEADZONE = 0.5;

const isPressed = (pad: Gamepad, idx: number): boolean => {
    const b = pad.buttons[idx];
    return !!b && (b.pressed || b.value > 0.5);
};

export class InputController {
    private readonly pressed = new Set<string>();
    /** Flat per-frame state for gamepad-driven buttons: index = player*16 + button. */
    private readonly gpDesired = new Uint8Array(NUM_PLAYERS * NUM_BUTTONS);
    private readonly gpCurrent = new Uint8Array(NUM_PLAYERS * NUM_BUTTONS);
    private rafId: number | null = null;
    private attached = false;
    private ffActive = false;
    private hkPrev = { fast: false, save: false, load: false, pause: false };

    constructor(
        private readonly gc: GameController,
        private bindings: InputBindings,
        private handlers: InputHandlers = {},
    ) {}

    setBindings(bindings: InputBindings): void {
        this.bindings = bindings;
    }

    attach(): void {
        if (this.attached) return;
        this.attached = true;
        document.addEventListener('keydown', this.onKeyDown);
        document.addEventListener('keyup',   this.onKeyUp);
        window.addEventListener('blur', this.releaseAll);
        this.rafId = requestAnimationFrame(this.gamepadTick);
    }

    detach(): void {
        if (!this.attached) return;
        this.attached = false;
        document.removeEventListener('keydown', this.onKeyDown);
        document.removeEventListener('keyup',   this.onKeyUp);
        window.removeEventListener('blur', this.releaseAll);
        if (this.rafId != null) cancelAnimationFrame(this.rafId);
        this.rafId = null;
        this.releaseAll();
    }

    private onKeyDown = (e: KeyboardEvent): void => {
        if (e.repeat) return;
        const code = e.code;
        const b = this.bindings;

        if (code === b.fastForwardKey) {
            e.preventDefault();
            if (!this.ffActive) { this.ffActive = true; this.gc.toggleFastForward(true); }
            return;
        }
        if (code === b.saveStateKey) { e.preventDefault(); this.handlers.onSaveState?.(); return; }
        if (code === b.loadStateKey) { e.preventDefault(); this.handlers.onLoadState?.(); return; }
        if (code === b.pauseKey)     { e.preventDefault(); this.handlers.onPause?.();     return; }

        const bind = b.keyMap[code];
        if (!bind || this.pressed.has(code)) return;
        e.preventDefault();
        this.pressed.add(code);
        this.gc.simulateInput(bind.player, bind.button, 1);
    };

    private onKeyUp = (e: KeyboardEvent): void => {
        const code = e.code;
        if (code === this.bindings.fastForwardKey) {
            if (this.ffActive) { this.ffActive = false; this.gc.toggleFastForward(false); }
            return;
        }
        const bind = this.bindings.keyMap[code];
        if (!bind || !this.pressed.has(code)) return;
        this.pressed.delete(code);
        this.gc.simulateInput(bind.player, bind.button, 0);
    };

    private releaseAll = (): void => {
        for (const code of this.pressed) {
            const bind = this.bindings.keyMap[code];
            if (bind) this.gc.simulateInput(bind.player, bind.button, 0);
        }
        this.pressed.clear();

        const cur = this.gpCurrent;
        for (let i = 0; i < cur.length; i++) {
            if (cur[i]) {
                cur[i] = 0;
                this.gc.simulateInput((i / NUM_BUTTONS) | 0, i % NUM_BUTTONS, 0);
            }
        }
        this.gpDesired.fill(0);

        if (this.ffActive) { this.ffActive = false; this.gc.toggleFastForward(false); }
        this.hkPrev = { fast: false, save: false, load: false, pause: false };
    };

    private gamepadTick = (): void => {
        const pads = navigator.getGamepads();
        const b = this.bindings;
        const assignment = b.gamepadAssignment;
        const desired = this.gpDesired;
        const current = this.gpCurrent;
        desired.fill(0);

        for (let player = 0; player < NUM_PLAYERS; player++) {
            const gpIndex = assignment?.[player] ?? player;
            const pad = pads[gpIndex];
            if (!pad) continue;
            const map = b.gamepadMap?.[player] ?? DEFAULT_GAMEPAD_MAP;
            const base = player * NUM_BUTTONS;

            for (const retroStr in map) {
                const retro = +retroStr;
                const physList = map[retro];
                if (!physList) continue;
                for (let i = 0; i < physList.length; i++) {
                    if (isPressed(pad, physList[i])) { desired[base + retro] = 1; break; }
                }
            }

            const axes = pad.axes;
            if (axes.length >= 2) {
                if (axes[0] < -AXIS_DEADZONE) desired[base + RetroPad.LEFT]  = 1;
                if (axes[0] >  AXIS_DEADZONE) desired[base + RetroPad.RIGHT] = 1;
                if (axes[1] < -AXIS_DEADZONE) desired[base + RetroPad.UP]    = 1;
                if (axes[1] >  AXIS_DEADZONE) desired[base + RetroPad.DOWN]  = 1;
            }
        }

        // Diff against last frame and emit edge events only.
        for (let i = 0; i < desired.length; i++) {
            const d = desired[i];
            if (d !== current[i]) {
                current[i] = d;
                this.gc.simulateInput((i / NUM_BUTTONS) | 0, i % NUM_BUTTONS, d);
            }
        }

        // System hotkey buttons — fire on any pad.
        const ff = b.fastForwardGamepad ?? -1;
        const ss = b.saveStateGamepad ?? -1;
        const ls = b.loadStateGamepad ?? -1;
        const ps = b.pauseGamepad ?? -1;
        let fastDown = false, saveDown = false, loadDown = false, pauseDown = false;
        for (let i = 0; i < pads.length; i++) {
            const pad = pads[i];
            if (!pad) continue;
            if (ff >= 0 && isPressed(pad, ff)) fastDown = true;
            if (ss >= 0 && isPressed(pad, ss)) saveDown = true;
            if (ls >= 0 && isPressed(pad, ls)) loadDown = true;
            if (ps >= 0 && isPressed(pad, ps)) pauseDown = true;
        }
        const hk = this.hkPrev;
        if (fastDown !== hk.fast) {
            hk.fast = fastDown;
            this.ffActive = fastDown;
            this.gc.toggleFastForward(fastDown);
        }
        if (saveDown && !hk.save)   this.handlers.onSaveState?.();
        if (loadDown && !hk.load)   this.handlers.onLoadState?.();
        if (pauseDown && !hk.pause) this.handlers.onPause?.();
        hk.save = saveDown;
        hk.load = loadDown;
        hk.pause = pauseDown;

        this.rafId = requestAnimationFrame(this.gamepadTick);
    };
}
