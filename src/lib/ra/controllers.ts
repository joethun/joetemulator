import { loadJSON, saveJSON, removeKey } from '@/lib/ra/storage';

const STORAGE_KEY = 'ra_controller_devices_v1';
const ANALOG_HINT = /analog|dualshock/i;

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
        if (colon1 < 0 || colon2 < 0) continue;
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

type Store = Record<string, Record<string, number>>;

const readStore = (): Store => loadJSON<Store | null>(STORAGE_KEY, null) ?? {};

export function loadStoredControllerDevices(libretroCore: string): Record<number, number> {
    const inner = readStore()[libretroCore] ?? {};
    const out: Record<number, number> = {};
    for (const [k, v] of Object.entries(inner)) {
        const p = Number(k);
        if (Number.isInteger(p) && typeof v === 'number') out[p] = v;
    }
    return out;
}

export function saveStoredControllerDevice(libretroCore: string, port: number, deviceId: number): void {
    const all = readStore();
    const inner = all[libretroCore] ?? {};
    inner[String(port)] = deviceId;
    all[libretroCore] = inner;
    saveJSON(STORAGE_KEY, all);
}

export function clearStoredControllerDevices(libretroCore: string): void {
    const all = readStore();
    if (!(libretroCore in all)) return;
    delete all[libretroCore];
    if (Object.keys(all).length) saveJSON(STORAGE_KEY, all);
    else removeKey(STORAGE_KEY);
}

/** Prefer an analog/DualShock-style device when the core offers one, so analog
 *  sticks register on systems whose default device is digital-only (PSX). */
export function pickDefaultDevice(devices: ControllerDevice[]): number | null {
    if (!devices.length) return null;
    return (devices.find(d => ANALOG_HINT.test(d.name)) ?? devices[0]).id;
}

/** Final device choice for a port: stored pref > analog-preferring default > core's first option. */
export function resolveDeviceForPort(
    port: ControllerPort,
    stored: Record<number, number>,
): number | null {
    const userPick = stored[port.port];
    if (userPick !== undefined && port.devices.some(d => d.id === userPick)) return userPick;
    return pickDefaultDevice(port.devices);
}
