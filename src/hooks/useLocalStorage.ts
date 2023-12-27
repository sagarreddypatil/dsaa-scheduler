import { useEffect, useState } from "react";

export default function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, _setValue] = useState<T>(defaultValue);

  useEffect(() => {
    const storedValue = localStorage.getItem(key);

    if (storedValue) {
      _setValue(JSON.parse(storedValue));
    } else {
      localStorage.setItem(key, JSON.stringify(defaultValue));
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key) {
        _setValue(JSON.parse(e.newValue!));
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [key]);

  const setValue: typeof _setValue = (action) => {
    const dispatchFn = (oldValue: T) => {
      const newValue = action instanceof Function ? action(oldValue) : action;
      localStorage.setItem(key, JSON.stringify(newValue));

      return newValue;
    };

    _setValue(dispatchFn);
  };

  return [value, setValue] as const;
}
