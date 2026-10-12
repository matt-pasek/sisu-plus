import {
  academicYearRangeFor,
  addDaysToDateKey,
  addMonthsToDateKey,
  startOfWeekKey,
  type Clash,
  type DateRange,
  type Session,
} from '@/app/schedule';
import type { CalendarView } from '../types';
import { monthStartKey, weekDateKeys } from './dates';
import { formatAcademicYear, formatDayTitle, formatMonthTitle, formatWeekRange } from './format';

export const CALENDAR_VIEWS: CalendarView[] = ['day', 'week', 'month', 'year'];

const VIEW_KEYS: Record<string, CalendarView> = { d: 'day', w: 'week', m: 'month', y: 'year' };

export const parseCalendarView = (value: unknown): CalendarView =>
  CALENDAR_VIEWS.find((view) => view === value) ?? 'week';

// The view lives in storage.sync, whose write quota the attendance plans share, so held keys must not write.
export const viewForKey = (key: string, repeat: boolean): CalendarView | null =>
  repeat ? null : (VIEW_KEYS[key.toLowerCase()] ?? null);

export const isNewNoteKey = (key: string, repeat: boolean): boolean => !repeat && key.toLowerCase() === 'n';

export const viewChange = (current: CalendarView, next: CalendarView): CalendarView | null =>
  next === current ? null : next;

export const stepAnchor = (view: CalendarView, anchorKey: string, delta: number): string => {
  if (view === 'day') return addDaysToDateKey(anchorKey, delta);
  if (view === 'week') return addDaysToDateKey(startOfWeekKey(anchorKey), delta * 7);
  if (view === 'month') return addMonthsToDateKey(monthStartKey(anchorKey), delta);
  return addMonthsToDateKey(anchorKey, delta * 12);
};

export const visibleRange = (view: CalendarView, anchorKey: string): DateRange => {
  if (view === 'day') return { startKey: anchorKey, endKey: addDaysToDateKey(anchorKey, 1) };
  if (view === 'week') {
    const monday = startOfWeekKey(anchorKey);
    return { startKey: monday, endKey: addDaysToDateKey(monday, 7) };
  }
  if (view === 'month') {
    const first = monthStartKey(anchorKey);
    return { startKey: first, endKey: addMonthsToDateKey(first, 1) };
  }
  return academicYearRangeFor(anchorKey);
};

export const clashesInRange = (clashes: Clash[], sessionsById: Map<string, Session>, range: DateRange): Clash[] =>
  clashes.filter((clash) =>
    clash.sessionIds.some((id) => {
      const session = sessionsById.get(id);
      return session != null && session.dateKey >= range.startKey && session.dateKey < range.endKey;
    }),
  );

export const viewTitle = (view: CalendarView, anchorKey: string, locale: string): string => {
  if (view === 'day') return formatDayTitle(anchorKey, locale);
  if (view === 'week') {
    const keys = weekDateKeys(anchorKey);
    return formatWeekRange(keys[0], keys[6], locale);
  }
  if (view === 'month') return formatMonthTitle(monthStartKey(anchorKey), locale);
  return formatAcademicYear(academicYearRangeFor(anchorKey));
};
