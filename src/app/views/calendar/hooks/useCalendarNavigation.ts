import { useCallback, useState } from 'react';
import type { CalendarView } from '../types';
import { stepAnchor } from '../util';

export const useCalendarNavigation = (view: CalendarView, todayKey: string, onNavigate: () => void) => {
  const [anchorKey, setAnchorKey] = useState(todayKey);
  const goBy = useCallback(
    (delta: number) => {
      onNavigate();
      setAnchorKey((current) => stepAnchor(view, current, delta));
    },
    [view, onNavigate],
  );
  const goToPrevious = useCallback(() => goBy(-1), [goBy]);
  const goToNext = useCallback(() => goBy(1), [goBy]);
  const goToToday = useCallback(() => {
    onNavigate();
    setAnchorKey(todayKey);
  }, [todayKey, onNavigate]);
  return { anchorKey, setAnchorKey, goToPrevious, goToNext, goToToday };
};
