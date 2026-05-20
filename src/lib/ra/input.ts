import type { GameController } from '@/lib/ra/game';

const RetroPad = {
    B: 0, Y: 1, SELECT: 2, START: 3,
    UP: 4, DOWN: 5, LEFT: 6, RIGHT: 7,
    A: 8, X: 9, L: 10, R: 11, L2: 12, R2: 13, L3: 14, R3: 15,
} as const;

/** Offsets into the per-player analog block; absolute retropad ids = ANALOG_BASE + offset. */
const RetroAnalog = {
    L_RIGHT: 0, L_LEFT: 1, L_DOWN: 2, L_UP: 3,
    R_RIGHT: 4, R_LEFT: 5, R_DOWN: 6, R_UP: 7,
} as const;

export const NUM_PLAYERS = 4;
const NUM_BUTTONS = 16;
const NUM_ANALOG = 8;
export const ANALOG_BASE = 16;
const ANALOG_MAX = 0x7fff;
/** Below this stick magnitude we report 0 — kills small idle drift so the diff doesn't churn. */
const ANALOG_DEADZONE = 0.12;
/** Threshold for treating an axis source as "pressed" when driving a digital retropad id. */
const AXIS_DIGITAL_THRESHOLD = 0.5;

export type KeyMap = Record<string, { player: number; button: number }>;

/**
 * A physical input on a gamepad that can drive a retropad id:
 *  - 'button': a face/shoulder/dpad button on the pad
 *  - 'axis':   one direction (sign) of a stick/trigger axis
 *
 * Any retropad id (digital 0..15 or analog 16..23) can be driven by any
 * combination of these. For a digital id, *any* active source pressed = pressed.
 * For an analog id, the max magnitude across sources wins (a held button
 * counts as full deflection).
 */
export type GamepadSource =
    | { kind: 'button'; index: number }
    | { kind: 'axis'; axis: number; sign: 1 | -1 };

/** retropad id → physical sources that drive it. */
export type GamepadBinding = Record<number, GamepadSource[]>;

export const sourceKey = (s: GamepadSource): string =>
    s.kind === 'button' ? `b${s.index}` : `a${s.axis}${s.sign > 0 ? '+' : '-'}`;

const DEFAULT_KEYMAP: KeyMap = {
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

const btn = (index: number): GamepadSource => ({ kind: 'button', index });
const axis = (axis: number, sign: 1 | -1): GamepadSource => ({ kind: 'axis', axis, sign });

/** Standard mapping: face/shoulder/dpad to buttons, sticks to axes 0/1 and 2/3. */
const DEFAULT_GAMEPAD_BINDING: GamepadBinding = {
    [RetroPad.B]:      [btn(0)],
    [RetroPad.A]:      [btn(1)],
    [RetroPad.Y]:      [btn(2)],
    [RetroPad.X]:      [btn(3)],
    [RetroPad.L]:      [btn(4)],
    [RetroPad.R]:      [btn(5)],
    [RetroPad.L2]:     [btn(6)],
    [RetroPad.R2]:     [btn(7)],
    [RetroPad.SELECT]: [btn(8)],
    [RetroPad.START]:  [btn(9)],
    [RetroPad.L3]:     [btn(10)],
    [RetroPad.R3]:     [btn(11)],
    [RetroPad.UP]:     [btn(12)],
    [RetroPad.DOWN]:   [btn(13)],
    [RetroPad.LEFT]:   [btn(14)],
    [RetroPad.RIGHT]:  [btn(15)],
    [ANALOG_BASE + RetroAnalog.L_RIGHT]: [axis(0,  1)],
    [ANALOG_BASE + RetroAnalog.L_LEFT]:  [axis(0, -1)],
    [ANALOG_BASE + RetroAnalog.L_DOWN]:  [axis(1,  1)],
    [ANALOG_BASE + RetroAnalog.L_UP]:    [axis(1, -1)],
    [ANALOG_BASE + RetroAnalog.R_RIGHT]: [axis(2,  1)],
    [ANALOG_BASE + RetroAnalog.R_LEFT]:  [axis(2, -1)],
    [ANALOG_BASE + RetroAnalog.R_DOWN]:  [axis(3,  1)],
    [ANALOG_BASE + RetroAnalog.R_UP]:    [axis(3, -1)],
};

const DEFAULT_GAMEPAD_BY_PLAYER: Record<number, GamepadBinding> = Object.fromEntries(
    Array.from({ length: NUM_PLAYERS }, (_, p) => [p, DEFAULT_GAMEPAD_BINDING]),
);

export interface InputBindings {
    keyMap: KeyMap;
    gamepadBindings?: Record<number, GamepadBinding>;
    gamepadAssignment?: Record<number, number>;
    fastForwardKey?: string;
    rewindKey?: string;
    saveStateKey?: string;
    loadStateKey?: string;
    pauseKey?: string;
    fastForwardGamepad?: number;
    rewindGamepad?: number;
    saveStateGamepad?: number;
    loadStateGamepad?: number;
    pauseGamepad?: number;
}

export const DEFAULT_BINDINGS: Required<InputBindings> = {
    keyMap: DEFAULT_KEYMAP,
    gamepadBindings: DEFAULT_GAMEPAD_BY_PLAYER,
    gamepadAssignment: {},
    fastForwardKey: '',
    rewindKey: '',
    saveStateKey: 'F1',
    loadStateKey: 'F2',
    pauseKey: 'Escape',
    fastForwardGamepad: -1,
    rewindGamepad: -1,
    saveStateGamepad: -1,
    loadStateGamepad: -1,
    pauseGamepad: -1,
};

/**
 * Drop key and gamepad bindings whose retropad id isn't in {@link allowedIds}.
 * Hotkeys are passed through — they're keycodes / hw button indices, not retropad ids.
 */
export function filterBindingsToButtons(
    bindings: InputBindings,
    allowedIds: ReadonlySet<number>,
): InputBindings {
    const keyMap: KeyMap = {};
    for (const code in bindings.keyMap) {
        const bind = bindings.keyMap[code];
        if (allowedIds.has(bind.button)) keyMap[code] = bind;
    }
    let gamepadBindings: Record<number, GamepadBinding> | undefined;
    const src = bindings.gamepadBindings;
    if (src) {
        gamepadBindings = {};
        for (const pStr in src) {
            const binding = src[+pStr];
            const inner: GamepadBinding = {};
            for (const retroStr in binding) {
                const retro = +retroStr;
                if (allowedIds.has(retro)) inner[retro] = binding[retro];
            }
            gamepadBindings[+pStr] = inner;
        }
    }
    return { ...bindings, keyMap, gamepadBindings };
}

export interface InputHandlers {
    onSaveState?: () => void;
    onLoadState?: () => void;
    onPause?: () => void;
}

export const isPressed = (pad: Gamepad, idx: number): boolean => {
    const b = pad.buttons[idx];
    return !!b && (b.pressed || b.value > 0.5);
};

const anyPressed = (pads: (Gamepad | null)[], idx: number): boolean => {
    if (idx < 0) return false;
    for (const pad of pads) if (pad && isPressed(pad, idx)) return true;
    return false;
};

/** Signed deflection of a source in [0, 1] (axis past deadzone, or button as 0/1). */
const sourceDeflection = (pad: Gamepad, s: GamepadSource): number => {
    if (s.kind === 'button') return isPressed(pad, s.index) ? 1 : 0;
    const raw = (pad.axes[s.axis] ?? 0) * s.sign;
    if (!Number.isFinite(raw) || raw < ANALOG_DEADZONE) return 0;
    return raw >= 1 ? 1 : raw;
};

export class InputController {
    private readonly pressed = new Set<string>();
    /** Flat per-frame state for gamepad-driven buttons: index = player*16 + button. */
    private readonly gpDesired = new Uint8Array(NUM_PLAYERS * NUM_BUTTONS);
    private readonly gpCurrent = new Uint8Array(NUM_PLAYERS * NUM_BUTTONS);
    /** Last-emitted analog magnitude per (player, analog-button-offset) for diffing. */
    private readonly gpAnalogCurrent = new Int16Array(NUM_PLAYERS * NUM_ANALOG);
    private readonly gpAnalogDesired = new Int16Array(NUM_PLAYERS * NUM_ANALOG);
    private rafId: number | null = null;
    private attached = false;
    private ffActive = false;
    private rwActive = false;
    private hkPrev = { fast: false, rewind: false, save: false, load: false, pause: false };

    constructor(
        private readonly gc: GameController,
        private bindings: InputBindings,
        private handlers: InputHandlers = {},
    ) {}

    setBindings(bindings: InputBindings): void { this.bindings = bindings; }

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

    private setFastForward(active: boolean): void {
        if (this.ffActive === active) return;
        this.ffActive = active;
        this.gc.toggleFastForward(active);
    }

    private setRewind(active: boolean): void {
        if (this.rwActive === active) return;
        this.rwActive = active;
        this.gc.toggleRewind(active);
    }

    private onKeyDown = (e: KeyboardEvent): void => {
        if (e.repeat) return;
        const code = e.code;
        const b = this.bindings;

        if (code === b.fastForwardKey) { e.preventDefault(); this.setFastForward(true);  return; }
        if (code === b.rewindKey)      { e.preventDefault(); this.setRewind(true);       return; }
        if (code === b.saveStateKey)   { e.preventDefault(); this.handlers.onSaveState?.(); return; }
        if (code === b.loadStateKey)   { e.preventDefault(); this.handlers.onLoadState?.(); return; }
        if (code === b.pauseKey)       { e.preventDefault(); this.handlers.onPause?.();     return; }

        const bind = b.keyMap[code];
        if (!bind || this.pressed.has(code)) return;
        e.preventDefault();
        this.pressed.add(code);
        this.gc.simulateInput(bind.player, bind.button, 1);
    };

    private onKeyUp = (e: KeyboardEvent): void => {
        const code = e.code;
        if (code === this.bindings.fastForwardKey) { this.setFastForward(false); return; }
        if (code === this.bindings.rewindKey)      { this.setRewind(false);      return; }
        const bind = this.bindings.keyMap[code];
        if (!bind || !this.pressed.has(code)) return;
        this.pressed.delete(code);
        this.gc.simulateInput(bind.player, bind.button, 0);
    };

    /** Emit simulateInput for every index where `desired` differs from `current`, then sync current. */
    private flush<T extends Uint8Array | Int16Array>(
        desired: T,
        current: T,
        stride: number,
        offset: number,
    ): void {
        for (let i = 0; i < desired.length; i++) {
            const d = desired[i];
            if (d !== current[i]) {
                current[i] = d;
                this.gc.simulateInput((i / stride) | 0, offset + (i % stride), d);
            }
        }
    }

    private releaseAll = (): void => {
        for (const code of this.pressed) {
            const bind = this.bindings.keyMap[code];
            if (bind) this.gc.simulateInput(bind.player, bind.button, 0);
        }
        this.pressed.clear();

        this.gpDesired.fill(0);
        this.gpAnalogDesired.fill(0);
        this.flush(this.gpDesired, this.gpCurrent, NUM_BUTTONS, 0);
        this.flush(this.gpAnalogDesired, this.gpAnalogCurrent, NUM_ANALOG, ANALOG_BASE);

        this.setFastForward(false);
        this.setRewind(false);
        this.hkPrev = { fast: false, rewind: false, save: false, load: false, pause: false };
    };

    private gamepadTick = (): void => {
        const pads = navigator.getGamepads();
        const b = this.bindings;
        const assignment = b.gamepadAssignment;
        const gpBindings = b.gamepadBindings;
        const desired = this.gpDesired;
        const current = this.gpCurrent;
        const analogCurrent = this.gpAnalogCurrent;
        const analogDesired = this.gpAnalogDesired;
        desired.fill(0);
        analogDesired.fill(0);

        for (let player = 0; player < NUM_PLAYERS; player++) {
            const pad = pads[assignment?.[player] ?? player];
            if (!pad) continue;
            const binding = gpBindings?.[player] ?? DEFAULT_GAMEPAD_BINDING;
            const base = player * NUM_BUTTONS;
            const aBase = player * NUM_ANALOG;

            for (const retroStr in binding) {
                const retro = +retroStr;
                const sources = binding[retro];
                if (!sources || sources.length === 0) continue;

                if (retro < ANALOG_BASE) {
                    for (let i = 0; i < sources.length; i++) {
                        if (sourceDeflection(pad, sources[i]) >= AXIS_DIGITAL_THRESHOLD) {
                            desired[base + retro] = 1;
                            break;
                        }
                    }
                } else {
                    let max = 0;
                    for (let i = 0; i < sources.length; i++) {
                        const d = sourceDeflection(pad, sources[i]);
                        if (d > max) max = d;
                    }
                    if (max > 0) analogDesired[aBase + (retro - ANALOG_BASE)] = Math.round(max * ANALOG_MAX);
                }
            }
        }

        this.flush(desired, current, NUM_BUTTONS, 0);
        this.flush(analogDesired, analogCurrent, NUM_ANALOG, ANALOG_BASE);

        // System hotkey buttons — fire on any pad.
        const fast   = anyPressed(pads, b.fastForwardGamepad ?? -1);
        const rewind = anyPressed(pads, b.rewindGamepad      ?? -1);
        const save   = anyPressed(pads, b.saveStateGamepad   ?? -1);
        const load   = anyPressed(pads, b.loadStateGamepad   ?? -1);
        const pause  = anyPressed(pads, b.pauseGamepad       ?? -1);
        const hk = this.hkPrev;
        if (fast   !== hk.fast)          this.setFastForward(fast);
        if (rewind !== hk.rewind)        this.setRewind(rewind);
        if (save   && !hk.save)          this.handlers.onSaveState?.();
        if (load   && !hk.load)          this.handlers.onLoadState?.();
        if (pause  && !hk.pause)         this.handlers.onPause?.();
        hk.fast = fast; hk.rewind = rewind; hk.save = save; hk.load = load; hk.pause = pause;

        this.rafId = requestAnimationFrame(this.gamepadTick);
    };
}
