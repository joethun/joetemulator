import { loadStringRecord, removeKey, saveJSON } from '@/lib/ra/storage';

const STORAGE_PREFIX = 'ra_core_options_v1:';
const DEFAULT_PREFIX = '(Default) ';

export interface CoreOption {
    key: string;
    label: string;
    /** Currently active value. */
    current: string;
    /** Choices, with "(Default) " prefix stripped. */
    choices: string[];
    defaultValue: string;
}

const stripDefault = (s: string): string =>
    s.startsWith(DEFAULT_PREFIX) ? s.slice(DEFAULT_PREFIX.length) : s;

function stripCorePrefix(key: string, libretroName?: string): string {
    if (!libretroName) return key;
    const sep = key[libretroName.length];
    if (key.startsWith(libretroName) && (sep === '_' || sep === '-')) {
        return key.slice(libretroName.length + 1);
    }
    return key;
}

/**
 * EmulatorJS cores serialise options as one option per line:
 *   `<name>[|<currentValue>]; <choice1>|<choice2>|…`
 * A choice may be prefixed with "(Default) " to mark the libretro default.
 */
export function parseCoreOptions(raw: string, libretroName?: string): CoreOption[] {
    if (!raw) return [];
    const out: CoreOption[] = [];
    for (const rawLine of raw.split('\n')) {
        const line = rawLine.trim();
        if (!line) continue;
        const semi = line.indexOf('; ');
        if (semi < 0) continue;
        const namePart = line.slice(0, semi);
        const optsPart = line.slice(semi + 2);

        const pipe = namePart.indexOf('|');
        const key = pipe >= 0 ? namePart.slice(0, pipe) : namePart;
        const explicitCurrent = pipe >= 0 ? namePart.slice(pipe + 1) : null;

        const rawChoices = optsPart.split('|').filter(Boolean);
        if (rawChoices.length < 2) continue;

        const defaultIdx = rawChoices.findIndex(c => c.startsWith(DEFAULT_PREFIX));
        const choices = rawChoices.map(stripDefault);
        const defaultValue = defaultIdx >= 0 ? choices[defaultIdx] : choices[0];

        out.push({
            key,
            label: stripCorePrefix(key, libretroName),
            current: explicitCurrent ?? defaultValue,
            choices,
            defaultValue,
        });
    }
    return out;
}

const k = (libretroName: string) => `${STORAGE_PREFIX}${libretroName}`;

export const loadStoredCoreOptions = (libretroName: string): Record<string, string> =>
    loadStringRecord(k(libretroName));

export function saveStoredCoreOption(libretroName: string, key: string, value: string): void {
    const current = loadStoredCoreOptions(libretroName);
    current[key] = value;
    saveJSON(k(libretroName), current);
}

export const clearStoredCoreOptions = (libretroName: string): void => removeKey(k(libretroName));
