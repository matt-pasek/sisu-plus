import { parseIsoDurationMs } from './duration';
import {
  addDaysToDateKey,
  addMonthsToDateKey,
  helsinkiDateKey,
  helsinkiMinutesOfDay,
  helsinkiWallTimeToInstant,
  parseSisuDateTime,
} from './time';
import type { DateRange, Occurrence, RecurrenceRule, RecurringSeries, SeriesOccurrence } from './types';

const MAX_OCCURRENCES = 400;

const nthDateKey = (firstKey: string, rule: RecurrenceRule, n: number): string | null => {
  switch (rule) {
    case 'DAILY':
      return addDaysToDateKey(firstKey, n);
    case 'WEEKLY':
      return addDaysToDateKey(firstKey, 7 * n);
    case 'EVERY_SECOND_WEEK':
      return addDaysToDateKey(firstKey, 14 * n);
    case 'MONTHLY':
      return addMonthsToDateKey(firstKey, n);
    default:
      return n === 0 ? firstKey : null;
  }
};

function* seriesDateKeys(firstKey: string, rule: RecurrenceRule, lastKey: string): Generator<string> {
  for (let n = 0; n < MAX_OCCURRENCES; n += 1) {
    const key = nthDateKey(firstKey, rule, n);
    if (key == null || key > lastKey) return;
    yield key;
  }
}

const generated = (series: RecurringSeries, range: DateRange): Occurrence[] => {
  const first = parseSisuDateTime(series.startTime);
  const firstKey = helsinkiDateKey(first);
  const startMinutes = helsinkiMinutesOfDay(first);
  const durationMs = parseIsoDurationMs(series.duration);
  const exceptions = new Set(series.exceptions ?? []);
  const cancellations = new Set(series.cancellations ?? []);
  const rangeLastKey = addDaysToDateKey(range.endKey, -1);
  const untilKey = series.recursUntil?.slice(0, 10);
  const lastKey = untilKey && untilKey < rangeLastKey ? untilKey : rangeLastKey;

  return [...seriesDateKeys(firstKey, series.recursEvery, lastKey)]
    .filter((key) => !exceptions.has(key))
    .map((key, index) => {
      const start = helsinkiWallTimeToInstant(key, startMinutes);
      return {
        seriesId: series.id,
        index,
        start,
        end: new Date(start.getTime() + durationMs),
        dateKey: key,
        cancelled: cancellations.has(key),
        locationIds: series.locationIds ?? [],
        notice: null,
      };
    });
};

const populated = (series: RecurringSeries, occurrences: SeriesOccurrence[]): Occurrence[] =>
  occurrences
    .filter(
      (occurrence): occurrence is SeriesOccurrence & { start: string } =>
        Boolean(occurrence.start) && occurrence.excluded !== true,
    )
    .map((occurrence, index) => {
      const start = parseSisuDateTime(occurrence.start);
      const end = occurrence.end
        ? parseSisuDateTime(occurrence.end)
        : new Date(start.getTime() + parseIsoDurationMs(occurrence.duration ?? series.duration));
      return {
        seriesId: series.id,
        index,
        start,
        end,
        dateKey: helsinkiDateKey(start),
        cancelled: occurrence.cancelled === true,
        locationIds: occurrence.irregularLocationIds ?? series.locationIds ?? [],
        notice: occurrence.notice ?? null,
      };
    });

export const expandSeries = (series: RecurringSeries, range: DateRange): Occurrence[] => {
  const all =
    series.occurrences && series.occurrences.length > 0
      ? populated(series, series.occurrences)
      : generated(series, range);
  const rangeStart = helsinkiWallTimeToInstant(range.startKey, 0);
  const rangeEnd = helsinkiWallTimeToInstant(range.endKey, 0);
  return all.filter((occurrence) => occurrence.end > rangeStart && occurrence.start < rangeEnd);
};
