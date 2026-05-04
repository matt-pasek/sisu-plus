import { useEffect, useState } from 'react';
import { SisuPrefs, DEFAULT_PREFS } from '@/app/types/prefs';
import i18n from '@/app/i18n';
import { isLocale } from '@/app/locales/locale';

export function useChromeStorage(): [SisuPrefs, (patch: Partial<SisuPrefs>) => void, boolean] {
  const [prefs, setPrefs] = useState<SisuPrefs>(DEFAULT_PREFS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    chrome.storage.sync.get(DEFAULT_PREFS, (stored) => {
      const nextPrefs = stored as SisuPrefs;
      setPrefs(nextPrefs);
      if (isLocale(nextPrefs.locale)) void i18n.changeLanguage(nextPrefs.locale);
      setIsLoaded(true);
    });

    const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      setPrefs((prev) => {
        const patch: Partial<SisuPrefs> = {};
        for (const key of Object.keys(changes) as (keyof SisuPrefs)[]) {
          (patch as Record<string, unknown>)[key] = changes[key].newValue;
        }
        const nextPrefs = { ...prev, ...patch };
        if (isLocale(patch.locale)) void i18n.changeLanguage(patch.locale);
        return nextPrefs;
      });
    };

    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  function setStoragePrefs(patch: Partial<SisuPrefs>) {
    chrome.storage.sync.set(patch);
  }

  return [prefs, setStoragePrefs, isLoaded];
}
