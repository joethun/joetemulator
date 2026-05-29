import { loadJSON, saveJSON, parseNumberRecord } from '@/lib/ra/storage';

const isNumber = (v: unknown): v is number => typeof v === 'number';

const STORAGE_KEY = 'ra_controller_devices_v1';

export interface ControllerDevice {
    id: number;
    name: string;
}

export interface ControllerPort {
    port: number;
    devices: ControllerDevice[];
    /** Device currently bound to the port. `null` until the runtime resolves one. */
    currentDevice: number | null;
}

/** Parse `port:deviceId:description` lines from {@link GameController.getControllerPortInfoRaw}. */
export function parseControllerPortInfo(raw: string): ControllerPort[] {
    const byPort = new Map<number, ControllerDevice[]>();
    for (const line of raw.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        const colon1 = trimmed.indexOf(':');
        const colon2 = colon1 >= 0 ? trimmed.indexOf(':', colon1 + 1) : -1;
        if (colon2 < 0) continue;
        const port = Number(trimmed.slice(0, colon1));
        const id   = Number(trimmed.slice(colon1 + 1, colon2));
        const name = trimmed.slice(colon2 + 1);
        if (!Number.isInteger(port) || !Number.isInteger(id) || !name) continue;
        const arr = byPort.get(port);
        if (arr) arr.push({ id, name });
        else byPort.set(port, [{ id, name }]);
    }
    return [...byPort.entries()]
        .sort(([a], [b]) => a - b)
        .map(([port, devices]) => ({ port, devices, currentDevice: null }));
}

/** Keyed per-game (not per-core): the user might want one PSX title on DualShock
 *  and another on the digital pad, even though they share PCSX-ReARMed. */
type Store = Record<string, Record<string, number>>;

const readStore = (): Store => loadJSON<Store | null>(STORAGE_KEY, null) ?? {};

export const loadStoredControllerDevices = (gameBaseName: string): Record<number, number> =>
    parseNumberRecord(readStore()[gameBaseName], isNumber);

export function saveStoredControllerDevice(gameBaseName: string, port: number, deviceId: number): void {
    const all = readStore();
    (all[gameBaseName] ??= {})[port] = deviceId;
    saveJSON(STORAGE_KEY, all);
}

/** Final device choice for a port: stored pref > the core's natural default (first device the core reports). */
export function resolveDeviceForPort(
    port: ControllerPort,
    stored: Record<number, number>,
): number | null {
    const userPick = stored[port.port];
    if (userPick !== undefined && port.devices.some(d => d.id === userPick)) return userPick;
    return port.devices[0]?.id ?? null;
}
