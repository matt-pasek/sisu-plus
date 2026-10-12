import type { CalendarEvent } from '@/app/api/generated/IlmoApi';
import {
  addDaysToDateKey,
  addMonthsToDateKey,
  expandSeries,
  formatIsoDuration,
  helsinkiDateKey,
  helsinkiMinutesOfDay,
  parseSisuDateTime,
  tryParseIsoDurationMs,
  type DateRange,
  type NoteOccurrence,
  type RecurringSeries,
} from '@/app/schedule';
import type { NoteChange, NoteDayAction, NoteDraft, NoteDraftErrors } from './types';

const MINUTE_MS = 60_000;
const LAST_MINUTE = 24 * 60 - 1;
const DEFAULT_DURATION_MS = 60 * MINUTE_MS;

export const PENDING_NOTE_PREFIX = 'pending-';

const pad = (value: number): string => String(value).padStart(2, '0');

export const isPendingNote = (noteId: string): boolean => noteId.startsWith(PENDING_NOTE_PREFIX);

export const noteOccurrenceId = (noteId: string, dateKey: string): string => `note:${noteId}@${dateKey}`;

const toNoteSeries = (event: CalendarEvent): RecurringSeries | null => {
  if (!event.id || event.documentState === 'DELETED') return null;
  if (tryParseIsoDurationMs(event.duration) == null) return null;
  if (Number.isNaN(parseSisuDateTime(event.startTime).getTime())) return null;
  return {
    id: event.id,
    startTime: event.startTime,
    duration: event.duration,
    recursEvery: event.recursEvery,
    recursUntil: event.recursEvery === 'NEVER' ? undefined : (event.recursUntil ?? undefined),
    exceptions: event.exceptions ?? [],
  };
};

export const mapNotes = (events: CalendarEvent[], range: DateRange): NoteOccurrence[] =>
  events
    .flatMap((event) => {
      const series = toNoteSeries(event);
      if (!series) return [];
      return expandSeries(series, range).map(
        (occurrence): NoteOccurrence => ({
          ...occurrence,
          id: noteOccurrenceId(series.id, occurrence.dateKey),
          noteId: series.id,
          name: event.name,
          recurring: event.recursEvery !== 'NEVER',
        }),
      );
    })
    .sort((a, b) => a.start.getTime() - b.start.getTime());

const toLocalDateTime = (dateKey: string, minutes: number): string =>
  `${dateKey}T${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;

const occursOn = (series: RecurringSeries, dateKey: string): boolean =>
  expandSeries({ ...series, exceptions: [] }, { startKey: dateKey, endKey: addDaysToDateKey(dateKey, 1) }).some(
    (occurrence) => occurrence.dateKey === dateKey,
  );

export const toCalendarEventPayload = (draft: NoteDraft, base?: CalendarEvent): CalendarEvent => {
  const next: CalendarEvent = {
    ...base,
    name: draft.title.trim(),
    startTime: toLocalDateTime(draft.dateKey, draft.startMinutes),
    duration: formatIsoDuration(draft.endMinutes - draft.startMinutes),
    recursEvery: draft.repeat,
    recursUntil: draft.repeat === 'NEVER' ? undefined : draft.untilKey,
    exceptions: [],
  };
  const series = toNoteSeries({ ...next, id: base?.id ?? 'draft' });
  // A one-off note's only day can itself be an exception, which would leave a note Sisu keeps but nobody sees.
  const kept =
    series && draft.repeat !== 'NEVER' ? (base?.exceptions ?? []).filter((dateKey) => occursOn(series, dateKey)) : [];
  return { ...next, exceptions: kept };
};

export const noteChangeFor = (draft: NoteDraft, base: CalendarEvent | null, pendingId: string): NoteChange =>
  base
    ? { type: 'update', event: toCalendarEventPayload(draft, base) }
    : { type: 'create', event: { ...toCalendarEventPayload(draft), id: pendingId } };

export const addException = (event: CalendarEvent, dateKey: string): CalendarEvent => ({
  ...event,
  exceptions: [...new Set([...(event.exceptions ?? []), dateKey])].sort(),
});

const visibleDays = (event: CalendarEvent): string[] => {
  const series = toNoteSeries(event);
  if (!series) return [];
  const firstKey = helsinkiDateKey(parseSisuDateTime(series.startTime));
  const lastKey =
    series.recursUntil?.slice(0, 10) ?? (series.recursEvery === 'NEVER' ? firstKey : maxUntilKey(firstKey));
  return expandSeries(series, { startKey: firstKey, endKey: addDaysToDateKey(lastKey, 1) }).map(
    (occurrence) => occurrence.dateKey,
  );
};

export const deleteDayAction = (event: CalendarEvent, dateKey: string): NoteDayAction => {
  const remaining = visibleDays(event).filter((day) => day !== dateKey);
  return remaining.length === 0
    ? { type: 'delete', noteId: event.id ?? '' }
    : { type: 'update', event: addException(event, dateKey) };
};

export const maxUntilKey = (dateKey: string): string => addDaysToDateKey(addMonthsToDateKey(dateKey, 12), -1);

export const defaultUntilKey = (dateKey: string, range: DateRange): string => {
  const rangeLast = addDaysToDateKey(range.endKey, -1);
  const preferred = rangeLast > dateKey ? rangeLast : dateKey;
  const cap = maxUntilKey(dateKey);
  return preferred < cap ? preferred : cap;
};

export const newNoteDraft = (
  dateKey: string,
  startMinutes: number,
  endMinutes: number,
  range: DateRange,
): NoteDraft => ({
  title: '',
  dateKey,
  startMinutes,
  endMinutes,
  repeat: 'NEVER',
  untilKey: defaultUntilKey(dateKey, range),
});

export const draftFromEvent = (event: CalendarEvent, range: DateRange): NoteDraft => {
  const start = parseSisuDateTime(event.startTime);
  const startMinutes = helsinkiMinutesOfDay(start);
  const durationMinutes = Math.round((tryParseIsoDurationMs(event.duration) ?? DEFAULT_DURATION_MS) / MINUTE_MS);
  const dateKey = helsinkiDateKey(start);
  return {
    title: event.name,
    dateKey,
    startMinutes,
    endMinutes: Math.min(startMinutes + durationMinutes, LAST_MINUTE),
    repeat: event.recursEvery,
    untilKey: event.recursUntil?.slice(0, 10) ?? defaultUntilKey(dateKey, range),
  };
};

export const validateNoteDraft = (draft: NoteDraft): NoteDraftErrors => {
  const repeating = draft.repeat !== 'NEVER';
  return {
    ...(draft.title.trim() === '' ? { title: 'required' as const } : {}),
    ...(draft.endMinutes <= draft.startMinutes ? { time: 'endBeforeStart' as const } : {}),
    ...(repeating && draft.untilKey < draft.dateKey ? { until: 'beforeDate' as const } : {}),
    ...(repeating && draft.untilKey > maxUntilKey(draft.dateKey) ? { until: 'tooFar' as const } : {}),
  };
};

export const hasErrors = (errors: NoteDraftErrors): boolean => Object.keys(errors).length > 0;
