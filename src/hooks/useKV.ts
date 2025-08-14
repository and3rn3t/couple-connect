import { useState, useEffect } from 'react';

/**
 * Simple key-value storage hook using localStorage
 * Replaces @github/spark/hooks useKV functionality
 */
export function useKV<T>(key: string, defaultValue?: T) {
  const [value, setValue] = useState<T | undefined>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  const setStoredValue = (newValue: T | undefined | ((prev: T | undefined) => T | undefined)) => {
    try {
      const valueToStore = typeof newValue === 'function' 
        ? (newValue as (prev: T | undefined) => T | undefined)(value)
        : newValue;
      
      setValue(valueToStore);
      if (valueToStore === undefined) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key) {
        try {
          const newValue = e.newValue ? JSON.parse(e.newValue) : defaultValue;
          setValue(newValue);
        } catch (error) {
          console.warn(`Error parsing localStorage value for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, defaultValue]);

  return [value, setStoredValue] as const;
}
