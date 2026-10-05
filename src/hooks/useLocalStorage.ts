import { useState, useEffect, useCallback, type Dispatch, type SetStateAction } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T)
): [T, Dispatch<SetStateAction<T>>, () => void] {
  // Read value from localStorage or fallback
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue instanceof Function ? initialValue() : initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        return JSON.parse(item) as T;
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }

    return initialValue instanceof Function ? initialValue() : initialValue;
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Return a wrapped version of useState's setter function that persists to localStorage
  const setValue: Dispatch<SetStateAction<T>> = useCallback(
    (value) => {
      if (typeof window === 'undefined') {
        console.warn(
          `Tried setting localStorage key "${key}" even though window is not defined`
        );
        return;
      }

      try {
        setStoredValue((current) => {
          const valueToStore = value instanceof Function ? value(current) : value;
          try {
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
          } catch (writeErr) {
            console.warn(`Error writing to localStorage for key "${key}":`, writeErr);
          }
          return valueToStore;
        });
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key]
  );

  // Remove value from localStorage and reset to initialValue
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      const fallback = initialValue instanceof Function ? initialValue() : initialValue;
      setStoredValue(fallback);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Listen to cross-tab storage events from other windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch {
          // Ignore parsing errors
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue, removeValue];
}
