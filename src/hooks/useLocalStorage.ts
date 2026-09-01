import { useState, useEffect, useRef, useCallback, useSyncExternalStore } from 'react';
import { loadJSON, saveJSON } from '@/lib/local-storage';

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
    const valueRef = useRef(value);

    // why: SSR-safe — render initialValue on server + first client paint, then read storage in an effect.
    useEffect(() => {
        const stored = loadJSON(key, valueRef.current);
        valueRef.current = stored;
        setValue(stored);
        markHydrated();
    }, [key]);

    // why: persist from the setter, not an effect — a write effect fires on mount with
    // initialValue and overwrites the stored value before the read above lands.
    const store = useCallback((next: T | ((prev: T) => T)) => {
        const resolved = typeof next === 'function' ? (next as (prev: T) => T)(valueRef.current) : next;
        valueRef.current = resolved;
        setValue(resolved);
        saveJSON(key, resolved);
    }, [key]);

    return [value, store] as const;
}
