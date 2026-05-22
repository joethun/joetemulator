import {
    DEFAULT_BINDINGS, sourceKey,
    type GamepadBinding, type GamepadSource, type InputBindings, type KeyMap,
} from '@/lib/ra/input';
import { loadJSON, saveJSON, removeKey } from '@/lib/ra/storage';

const STORAGE_KEY = 'ra_bindings_v2';

const isObj = (v: unknown): v is Record<string, unknown> =>
    !!v && typeof v === 'object';
const isPosInt = (v: unknown): v is number =>
    Number.isInteger(v) && (v as number) >= 0;
const asBtn = (v: unknown): number => isPosInt(v) ? v : -1;

function parseSource(raw: unknown): GamepadSource | null {
    if (!isObj(raw)) return null;
    if (raw.kind === 'button' && isPosInt(raw.index)) {
        return { kind: 'button', index: raw.index };
    }
    if (raw.kind === 'axis' && isPosInt(raw.axis) && (raw.sign === 1 || raw.sign === -1)) {
        return { kind: 'axis', axis: raw.axis, sign: raw.sign };
    }
    return null;
}

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

function parseGamepadBindings(value: unknown): Record<number, GamepadBinding> {
    if (!isObj(value)) return {};
    const out: Record<number, GamepadBinding> = {};
    for (const [pStr, sub] of Object.entries(value)) {
        const player = Number(pStr);
        if (!Number.isInteger(player) || !isObj(sub)) continue;
        const inner: GamepadBinding = {};
        for (const [retroStr, sourcesRaw] of Object.entries(sub)) {
            const retro = Number(retroStr);
            if (!Number.isInteger(retro) || !Array.isArray(sourcesRaw)) continue;
            const seen = new Set<string>();
            const sources: GamepadSource[] = [];
            for (const s of sourcesRaw) {
                const parsed = parseSource(s);
                if (!parsed) continue;
                const key = sourceKey(parsed);
                if (seen.has(key)) continue;
                seen.add(key);
                sources.push(parsed);
            }
            if (sources.length) inner[retro] = sources;
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
    const gamepadBindings = parseGamepadBindings(parsed.gamepadBindings);
    return {
        keyMap:             Object.keys(keyMap).length ? keyMap : DEFAULT_BINDINGS.keyMap,
        gamepadBindings:    Object.keys(gamepadBindings).length ? gamepadBindings : DEFAULT_BINDINGS.gamepadBindings,
        gamepadAssignment:  parseAssignment(parsed.gamepadAssignment),
        fastForwardKey:     parsed.fastForwardKey ?? DEFAULT_BINDINGS.fastForwardKey,
        saveStateKey:       parsed.saveStateKey   ?? DEFAULT_BINDINGS.saveStateKey,
        loadStateKey:       parsed.loadStateKey   ?? DEFAULT_BINDINGS.loadStateKey,
        pauseKey:           parsed.pauseKey       ?? DEFAULT_BINDINGS.pauseKey,
        fastForwardGamepad: asBtn(parsed.fastForwardGamepad),
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
