import type { IcsEvent } from 'ts-ics';
import { helsinkiDateKey } from './time';
import type { LinkedImport, LinkedSeries, RecurrenceRule } from './types';

const MINUTE_MS = 60_000;
const UNSAFE_ID = /[^A-Za-z0-9_-]/g;

const endOf = (event: IcsEvent): Date | null => {
  if ('end' in event && event.end) return event.end.date;
  if ('duration' in event && event.duration) {
    const { weeks = 0, days = 0, hours = 0, minutes = 0, seconds = 0 } = event.duration;
    const ms = (((weeks * 7 + days) * 24 + hours) * 60 + minutes) * MINUTE_MS + seconds * 1000;
    return new Date(event.start.date.getTime() + ms);
  }
  return null;
};

const recurrenceOf = (event: IcsEvent): RecurrenceRule | null => {
  const rule = event.recurrenceRule;
  if (!rule) return 'NEVER';
  if (rule.count != null || (rule.byDay?.length ?? 0) > 1 || rule.byMonthday || rule.byMonth || rule.bySetPos) {
    return null;
  }
  const interval = rule.interval ?? 1;
  if (rule.frequency === 'DAILY' && interval === 1) return 'DAILY';
  if (rule.frequency === 'WEEKLY' && interval === 1) return 'WEEKLY';
  if (rule.frequency === 'WEEKLY' && interval === 2) return 'EVERY_SECOND_WEEK';
  return null;
};

const toItem = (event: IcsEvent): { item: LinkedSeries; firstOnly: boolean } | null => {
  const end = endOf(event);
  if (!end || end <= event.start.date) return null;
  const rule = recurrenceOf(event);
  const cancelled = event.status === 'CANCELLED';
  const minutes = Math.round((end.getTime() - event.start.date.getTime()) / MINUTE_MS);
  const id = `linked-${event.uid.replace(UNSAFE_ID, '_')}-${event.start.date.getTime()}`;
  const startTime = event.start.date.toISOString();
  const shared = { summary: event.summary, location: event.location?.trim() || null };

  if (rule != null && rule !== 'NEVER') {
    if (cancelled) return null;
    const until = event.recurrenceRule?.until;
    return {
      item: {
        ...shared,
        series: {
          id,
          startTime,
          duration: `PT${minutes}M`,
          recursEvery: rule,
          recursUntil: until ? helsinkiDateKey(until.date) : undefined,
          exceptions: (event.exceptionDates ?? []).map((exception) => helsinkiDateKey(exception.date)),
        },
      },
      firstOnly: false,
    };
  }

  return {
    item: {
      ...shared,
      series: {
        id,
        startTime,
        duration: `PT${minutes}M`,
        recursEvery: 'NEVER',
        occurrences: [{ start: startTime, end: end.toISOString(), cancelled }],
      },
    },
    firstOnly: rule == null,
  };
};

export const toLinkedSeries = (events: IcsEvent[], courseCode: string | null): LinkedImport => {
  const timed = events.filter((event) => event.start.type !== 'DATE');
  const code = courseCode?.toLowerCase() ?? null;
  const mentions = (event: IcsEvent): boolean => code != null && event.summary.toLowerCase().includes(code);
  const matched = timed.filter(mentions).length;
  const kept = matched > 0 && matched < timed.length ? timed.filter(mentions) : timed;
  const results = kept
    .map(toItem)
    .filter((result): result is { item: LinkedSeries; firstOnly: boolean } => result != null);
  return {
    items: results.map((result) => result.item),
    total: timed.length,
    matched,
    skippedAllDay: events.length - timed.length,
    firstOnly: results.filter((result) => result.firstOnly).length,
  };
};
