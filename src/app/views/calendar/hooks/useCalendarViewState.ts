import { useCallback } from 'react';
import type { SisuPrefs } from '@/app/types/prefs';
import type { CalendarView } from '../types';
import { parseCalendarView, viewChange } from '../util';
import { useCalendarNavigation } from './useCalendarNavigation';

export const useCalendarViewState = (
  prefs: SisuPrefs,
  setPrefs: (patch: Partial<SisuPrefs>) => void,
  todayKey: string,
  onNavigate: () => void,
) => {
  const view = parseCalendarView(prefs.calendarView);
  const navigation = useCalendarNavigation(view, todayKey, onNavigate);
  const { setAnchorKey } = navigation;
  const setView = useCallback(
    (next: CalendarView) => {
      const change = viewChange(view, next);
      if (!change) return;
      onNavigate();
      setPrefs({ calendarView: change });
    },
    [view, setPrefs, onNavigate],
  );
  const openWeek = useCallback(
    (dateKey: string) => {
      setAnchorKey(dateKey);
      setView('week');
    },
    [setAnchorKey, setView],
  );
  const openDay = useCallback(
    (dateKey: string) => {
      setAnchorKey(dateKey);
      setView('day');
    },
    [setAnchorKey, setView],
  );
  return { view, ...navigation, setView, openWeek, openDay };
};
