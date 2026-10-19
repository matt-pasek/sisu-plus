import { useCallback, useEffect, useState } from 'react';
import { useChromeStorage } from '@/app/hooks/useChromeStorage';
import { HERO_AUTO_FOLD_MAX_HEIGHT } from '@/app/views/timeline/constants/hero.const';

const SHORT_WINDOW_QUERY = `(max-height: ${HERO_AUTO_FOLD_MAX_HEIGHT - 1}px)`;

export const useHeroFold = (): { folded: boolean; ready: boolean; toggle: () => void } => {
  const [prefs, setPrefs, isLoaded] = useChromeStorage();
  const [isShortWindow, setIsShortWindow] = useState(() => window.matchMedia(SHORT_WINDOW_QUERY).matches);

  useEffect(() => {
    const query = window.matchMedia(SHORT_WINDOW_QUERY);
    const onChange = (event: MediaQueryListEvent) => setIsShortWindow(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  const explicit = isLoaded ? prefs.timelineHeroFolded : null;
  const folded = explicit ?? isShortWindow;
  const toggle = useCallback(() => setPrefs({ timelineHeroFolded: !folded }), [folded, setPrefs]);

  return { folded, ready: isLoaded, toggle };
};
