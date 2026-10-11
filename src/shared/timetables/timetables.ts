import type { TimetableFailure } from './TimetableFailure.type';
import type { TimetableFetchResult } from './TimetableFetchResult.type';

export const MAX_TIMETABLE_BYTES = 2 * 1024 * 1024;
export const TIMETABLE_GRANT_KEY = 'timetableGrant';

const FAILURES: TimetableFailure[] = ['invalid', 'permission', 'network', 'notCalendar', 'tooLarge'];
const BARE_HTTPS_ORIGIN = /^https:\/\/[a-z0-9.-]+(?::\d+)?$/i;

export const isCalendarText = (text: string): boolean => /^\s*BEGIN:VCALENDAR/i.test(text);

export const validTimetableUrl = (value: unknown): URL | null => {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password ? url : null;
  } catch {
    return null;
  }
};

export const isGrantableOrigin = (value: unknown): value is string =>
  typeof value === 'string' && BARE_HTTPS_ORIGIN.test(value);

export const isTimetableFetchResult = (value: unknown): value is TimetableFetchResult => {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  if (record.ok === true) return typeof record.text === 'string';
  return record.ok === false && FAILURES.includes(record.reason as TimetableFailure);
};
