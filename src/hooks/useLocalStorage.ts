import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const item = localStorage.getItem(key);
      if (item) setValue(JSON.parse(item));
    } catch (error) {
      console.error(`error reading localStorage key "${key}":`, error);
    }
    setIsHydrated(true);
  }, [key]);

  useEffect(() => {
    if (typeof window === 'undefined' || !isHydrated) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`error writing to localStorage key "${key}":`, error);
    }
  }, [key, value, isHydrated]);

  return [value, setValue, isHydrated] as const;
}
