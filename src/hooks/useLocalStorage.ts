import { useState, useEffect } from 'react';

/**
 * persists state to localStorage with hydration tracking
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);

  // hydrate from storage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const item = localStorage.getItem(key);
      if (item) {
        setValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(`failed to read localStorage key "${key}":`, error);
    }

    setIsHydrated(true);
  }, [key]);

  // persist changes to storage
  useEffect(() => {
    if (typeof window === 'undefined' || !isHydrated) return;

    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`failed to write localStorage key "${key}":`, error);
    }
  }, [key, value, isHydrated]);

  return [value, setValue, isHydrated] as const;
}
