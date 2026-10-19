import { useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { addDaysToDateKey } from '@/app/schedule';
import type { YearWeek } from '../types';

const ARROW_DAYS: Record<string, number> = { ArrowUp: -1, ArrowDown: 1, ArrowLeft: -7, ArrowRight: 7 };

export const useYearFocus = (weeks: YearWeek[]) => {
  const ref = useRef<HTMLDivElement>(null);
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const { inYearKeys, defaultKey } = useMemo(() => {
    const days = weeks.flatMap((week) => week.days).filter((day) => day.inYear);
    return {
      inYearKeys: new Set(days.map((day) => day.dateKey)),
      defaultKey: (days.find((day) => day.isToday) ?? days[0])?.dateKey ?? null,
    };
  }, [weeks]);
  // A cell focused in another academic year is not rendered here, and without a fallback no cell is tabbable.
  const activeKey = focusKey && inYearKeys.has(focusKey) ? focusKey : defaultKey;

  // Arrows move between cells here; stopping them keeps the window shortcut from also changing the year.
  const onKeyDown = (event: KeyboardEvent) => {
    const step = ARROW_DAYS[event.key];
    if (step == null || !activeKey) return;
    event.preventDefault();
    event.stopPropagation();
    ref.current?.querySelector<HTMLElement>(`[data-date-key="${addDaysToDateKey(activeKey, step)}"]`)?.focus();
  };

  return { ref, activeKey, setFocusKey, onKeyDown };
};
