import {
    DEFAULT_BINDINGS,
    type GamepadRetroMap, type InputBindings, type KeyMap,
} from '@/lib/ra/input';
import { loadJSON, saveJSON, removeKey } from '@/lib/ra/storage';

const STORAGE_KEY = 'ra_bindings_v1';

const isObj = (v: unknown): v is Record<string, unknown> =>
    !!v && typeof v === 'object';
const isPosInt = (v: unknown): v is number =>
    typeof v === 'number' && Number.isInteger(v) && v >= 0;
const asBtn = (v: unknown): number => isPosInt(v) ? v : -1;

function parseKeyMap(value: unknown): KeyMap {
    if (!isObj(value)) return {};
    const out: KeyMap = {};
    for (const [code, raw] of Object.entries(value)) {
        if (!isObj(raw)) continue;
        const { player, button } = raw;
        if (typeof player === 'number' && typeof button === 'number') {
            out[code] = { player, button };
        }
    }
    return out;
}

function parseGamepadMap(value: unknown): Record<number, GamepadRetroMap> {
    if (!isObj(value)) return {};
    const out: Record<number, GamepadRetroMap> = {};
    for (const [pStr, sub] of Object.entries(value)) {
        const player = Number(pStr);
        if (!Number.isInteger(player) || !isObj(sub)) continue;
        const inner: GamepadRetroMap = {};
        for (const [retroStr, phys] of Object.entries(sub)) {
            const retro = Number(retroStr);
            if (!Number.isInteger(retro) || !Array.isArray(phys)) continue;
            const filtered = phys.filter(isPosInt);
            if (filtered.length) inner[retro] = Array.from(new Set(filtered)).sort((a, b) => a - b);
        }
        if (Object.keys(inner).length) out[player] = inner;
    }
    return out;
}

function parseAssignment(value: unknown): Record<number, number> {
    if (!isObj(value)) return {};
    const out: Record<number, number> = {};
    for (const [k, v] of Object.entries(value)) {
        const player = Number(k);
        if (Number.isInteger(player) && isPosInt(v)) out[player] = v;
    }
    return out;
}

export function loadStoredBindings(): Required<InputBindings> {
    const parsed = loadJSON<Partial<InputBindings> | null>(STORAGE_KEY, null);
    if (!parsed) return DEFAULT_BINDINGS;
    const keyMap = parseKeyMap(parsed.keyMap);
    const gamepadMap = parseGamepadMap(parsed.gamepadMap);
    return {
        keyMap:             Object.keys(keyMap).length     ? keyMap     : DEFAULT_BINDINGS.keyMap,
        gamepadMap:         Object.keys(gamepadMap).length ? gamepadMap : DEFAULT_BINDINGS.gamepadMap,
        gamepadAssignment:  parseAssignment(parsed.gamepadAssignment),
        fastForwardKey:     parsed.fastForwardKey ?? DEFAULT_BINDINGS.fastForwardKey,
        rewindKey:          parsed.rewindKey      ?? DEFAULT_BINDINGS.rewindKey,
        saveStateKey:       parsed.saveStateKey   ?? DEFAULT_BINDINGS.saveStateKey,
        loadStateKey:       parsed.loadStateKey   ?? DEFAULT_BINDINGS.loadStateKey,
        pauseKey:           parsed.pauseKey       ?? DEFAULT_BINDINGS.pauseKey,
        fastForwardGamepad: asBtn(parsed.fastForwardGamepad),
        rewindGamepad:      asBtn(parsed.rewindGamepad),
        saveStateGamepad:   asBtn(parsed.saveStateGamepad),
        loadStateGamepad:   asBtn(parsed.loadStateGamepad),
        pauseGamepad:       asBtn(parsed.pauseGamepad),
    };
}

export const saveStoredBindings = (b: InputBindings): void => saveJSON(STORAGE_KEY, b);

export function resetStoredBindings(): Required<InputBindings> {
    removeKey(STORAGE_KEY);
    return DEFAULT_BINDINGS;
}
