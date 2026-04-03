import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
    const [value, setValue] = useState<T>(initialValue);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        try {
            const item = localStorage.getItem(key);
            if (item !== null) setValue(JSON.parse(item));
        } catch (e) {
            console.error(`localStorage read error "${key}":`, e);
        }
        setIsHydrated(true);
    }, [key]);

    useEffect(() => {
        if (!isHydrated) return;
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error(`localStorage write error "${key}":`, e);
        }
    }, [key, value, isHydrated]);

    return [value, setValue, isHydrated] as const;
}
