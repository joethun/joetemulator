import {
    DEFAULT_BINDINGS, sourceKey,
    type GamepadBinding, type GamepadSource, type InputBindings, type KeyMap,
} from '@/lib/ra/input';
import { loadJSON, saveJSON, removeKey, isObject, isPosInt, parseNumberRecord } from '@/lib/local-storage';

const STORAGE_KEY = 'ra_bindings_v2';

const asBtn = (v: unknown): number => isPosInt(v) ? v : -1;

function parseSource(raw: unknown): GamepadSource | null {
    if (!isObject(raw)) return null;
    if (raw.kind === 'button' && isPosInt(raw.index)) {
        return { kind: 'button', index: raw.index };
    }
    if (raw.kind === 'axis' && isPosInt(raw.axis) && (raw.sign === 1 || raw.sign === -1)) {
        return { kind: 'axis', axis: raw.axis, sign: raw.sign };
    }
    return null;
}

function parseKeyMap(value: unknown): KeyMap {
    if (!isObject(value)) return {};
    const out: KeyMap = {};
    for (const [code, raw] of Object.entries(value)) {
        if (!isObject(raw)) continue;
        const { player, button } = raw;
        if (typeof player === 'number' && typeof button === 'number') {
            out[code] = { player, button };
        }
    }
    return out;
}

function parseGamepadBindings(value: unknown): Record<number, GamepadBinding> {
    if (!isObject(value)) return {};
    const out: Record<number, GamepadBinding> = {};
    for (const [pStr, sub] of Object.entries(value)) {
        const player = Number(pStr);
        if (!Number.isInteger(player) || !isObject(sub)) continue;
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

export function loadStoredBindings(): Required<InputBindings> {
    const parsed = loadJSON<Partial<InputBindings> | null>(STORAGE_KEY, null);
    if (!parsed) return DEFAULT_BINDINGS;
    const keyMap = parseKeyMap(parsed.keyMap);
    const gamepadBindings = parseGamepadBindings(parsed.gamepadBindings);
    return {
        keyMap:             Object.keys(keyMap).length ? keyMap : DEFAULT_BINDINGS.keyMap,
        gamepadBindings:    Object.keys(gamepadBindings).length ? gamepadBindings : DEFAULT_BINDINGS.gamepadBindings,
        gamepadAssignment:  parseNumberRecord(parsed.gamepadAssignment, isPosInt),
        fastForwardKey:     parsed.fastForwardKey ?? DEFAULT_BINDINGS.fastForwardKey,
        saveStateKey:       parsed.saveStateKey   ?? DEFAULT_BINDINGS.saveStateKey,
        loadStateKey:       parsed.loadStateKey   ?? DEFAULT_BINDINGS.loadStateKey,
        fastForwardGamepad: asBtn(parsed.fastForwardGamepad),
        saveStateGamepad:   asBtn(parsed.saveStateGamepad),
        loadStateGamepad:   asBtn(parsed.loadStateGamepad),
    };
}

export const saveStoredBindings = (b: InputBindings): void => saveJSON(STORAGE_KEY, b);

export function resetStoredBindings(): Required<InputBindings> {
    removeKey(STORAGE_KEY);
    return DEFAULT_BINDINGS;
}
