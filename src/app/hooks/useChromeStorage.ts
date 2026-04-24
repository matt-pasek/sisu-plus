import { useEffect, useState } from 'react';
import { SisuPrefs, DEFAULT_PREFS } from '@/app/types/prefs';

export function useChromeStorage(): [SisuPrefs, (patch: Partial<SisuPrefs>) => void] {
  const [prefs, setPrefs] = useState<SisuPrefs>(DEFAULT_PREFS);

  useEffect(() => {
    chrome.storage.sync.get(DEFAULT_PREFS, (stored) => {
      setPrefs(stored as SisuPrefs);
    });

    const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      setPrefs((prev) => {
        const patch: Partial<SisuPrefs> = {};
        for (const key of Object.keys(changes) as (keyof SisuPrefs)[]) {
          (patch as Record<string, unknown>)[key] = changes[key].newValue;
        }
        return { ...prev, ...patch };
      });
    };

    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  function setStoragePrefs(patch: Partial<SisuPrefs>) {
    chrome.storage.sync.set(patch);
  }

  return [prefs, setStoragePrefs];
}
