import { useState, useEffect } from 'react';

const isServer = typeof window === 'undefined';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (isServer) return;
    try {
      const item = localStorage.getItem(key);
      if (item !== null) setValue(JSON.parse(item));
    } catch (e) {
      console.error(`Error reading localStorage key "${key}":`, e);
    } finally {
      setIsHydrated(true);
    }
  }, [key]);

  useEffect(() => {
    if (isServer || !isHydrated) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error writing localStorage key "${key}":`, e);
    }
  }, [key, value, isHydrated]);

  return [value, setValue, isHydrated] as const;
}
