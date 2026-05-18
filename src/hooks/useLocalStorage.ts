import { useState, useEffect, useSyncExternalStore } from 'react';

let hydrated = false;
const listeners = new Set<() => void>();

function markHydrated() {
    if (hydrated) return;
    hydrated = true;
    listeners.forEach(l => l());
}

export function useHydrated(): boolean {
    return useSyncExternalStore(
        cb => { listeners.add(cb); return () => { listeners.delete(cb); }; },
        () => hydrated,
        () => false,
    );
}

export function useLocalStorage<T>(key: string, initialValue: T) {
    const [value, setValue] = useState<T>(initialValue);

    // why: SSR-safe — render initialValue on server + first client paint, then read storage in an effect.
    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        try {
            const item = localStorage.getItem(key);
            if (item !== null) setValue(JSON.parse(item));
        } catch (e) {
            console.error(`localStorage read error "${key}":`, e);
        }
        markHydrated();
    }, [key]);
    /* eslint-enable react-hooks/set-state-in-effect */

    useEffect(() => {
        if (!hydrated) return;
        try { localStorage.setItem(key, JSON.stringify(value)); }
        catch (e) { console.error(`localStorage write error "${key}":`, e); }
    }, [key, value]);

    return [value, setValue] as const;
}
