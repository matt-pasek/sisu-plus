/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import type { CalendarEvent } from '@/app/api/generated/IlmoApi';
import { helsinkiMinutesOfDay } from '@/app/schedule';
import {
  addException,
  defaultUntilKey,
  deleteDayAction,
  draftFromEvent,
  hasErrors,
  isPendingNote,
  mapNotes,
  maxUntilKey,
  newNoteDraft,
  noteChangeFor,
  toCalendarEventPayload,
  validateNoteDraft,
} from './notes';

const AUTUMN = { startKey: '2026-08-01', endKey: '2027-01-01' };
const SPRING = { startKey: '2027-01-01', endKey: '2027-08-01' };

const event = (overrides: Partial<CalendarEvent> = {}): CalendarEvent => ({
  id: 'otm-note-1',
  name: 'Study group',
  startTime: '2026-10-20T14:00',
  duration: 'PT1H30M',
  recursEvery: 'NEVER',
  exceptions: [],
  ...overrides,
});

const days = (events: CalendarEvent[], range = AUTUMN): string[] => mapNotes(events, range).map((note) => note.dateKey);

describe('mapNotes', () => {
  test('maps a one-off note to one occurrence in Finnish time', () => {
    const [note] = mapNotes([event()], AUTUMN);
    expect(note.id).toBe('note:otm-note-1@2026-10-20');
    expect(note.noteId).toBe('otm-note-1');
    expect(note.name).toBe('Study group');
    expect(note.recurring).toBe(false);
    expect(helsinkiMinutesOfDay(note.start)).toBe(14 * 60);
    expect(helsinkiMinutesOfDay(note.end)).toBe(15 * 60 + 30);
  });

  test('repeats weekly until the until date, keeping 14.00 across the 25 Oct DST change', () => {
    const notes = mapNotes([event({ recursEvery: 'WEEKLY', recursUntil: '2026-11-10' })], AUTUMN);
    expect(notes.map((note) => note.dateKey)).toEqual(['2026-10-20', '2026-10-27', '2026-11-03', '2026-11-10']);
    expect(notes.every((note) => helsinkiMinutesOfDay(note.start) === 14 * 60)).toBe(true);
    expect(notes.every((note) => note.recurring)).toBe(true);
  });

  test('repeats every second week and monthly', () => {
    expect(days([event({ recursEvery: 'EVERY_SECOND_WEEK', recursUntil: '2026-11-17' })])).toEqual([
      '2026-10-20',
      '2026-11-03',
      '2026-11-17',
    ]);
    expect(days([event({ startTime: '2026-10-31T09:00', recursEvery: 'MONTHLY', recursUntil: '2027-01-31' })])).toEqual(
      ['2026-10-31', '2026-11-30', '2026-12-31'],
    );
  });

  test('leaves out exception days', () => {
    expect(days([event({ recursEvery: 'WEEKLY', recursUntil: '2026-11-10', exceptions: ['2026-10-27'] })])).toEqual([
      '2026-10-20',
      '2026-11-03',
      '2026-11-10',
    ]);
  });

  test('a series that started before the range still shows inside it', () => {
    expect(
      days([event({ startTime: '2026-12-15T10:00', recursEvery: 'WEEKLY', recursUntil: '2027-01-19' })], SPRING),
    ).toEqual(['2027-01-05', '2027-01-12', '2027-01-19']);
  });

  test('skips notes without an id, with a broken duration or deleted', () => {
    expect(days([event({ id: undefined }), event({ duration: 'soon' }), event({ documentState: 'DELETED' })])).toEqual(
      [],
    );
  });

  test('sorts occurrences from several notes by start', () => {
    const later = event({ id: 'b', startTime: '2026-10-20T16:00' });
    const earlier = event({ id: 'a', startTime: '2026-10-20T08:00' });
    expect(mapNotes([later, earlier], AUTUMN).map((note) => note.noteId)).toEqual(['a', 'b']);
  });

  test('pending notes are recognised by their id', () => {
    expect(isPendingNote('pending-123')).toBe(true);
    expect(isPendingNote('otm-note-1')).toBe(false);
  });
});

describe('toCalendarEventPayload', () => {
  test('writes a one-off note as Helsinki local time with no until date', () => {
    const draft = { ...newNoteDraft('2026-10-21', 600, 660, AUTUMN), title: '  Dentist ' };
    const payload = toCalendarEventPayload(draft);
    expect(payload).toEqual({
      name: 'Dentist',
      startTime: '2026-10-21T10:00',
      duration: 'PT1H',
      recursEvery: 'NEVER',
      recursUntil: undefined,
      exceptions: [],
    });
  });

  test('sends the until date only when the note repeats', () => {
    const draft = { ...newNoteDraft('2026-10-21', 600, 690, AUTUMN), title: 'Gym', repeat: 'WEEKLY' as const };
    expect(toCalendarEventPayload(draft).recursUntil).toBe('2026-12-31');
    expect(toCalendarEventPayload(draft).duration).toBe('PT1H30M');
  });

  test('keeps unknown fields and exceptions that still fall on an occurrence', () => {
    const base = event({
      documentState: 'ACTIVE',
      userId: 'otm-user',
      recursEvery: 'WEEKLY',
      recursUntil: '2026-11-24',
      exceptions: ['2026-10-27', '2026-11-10'],
    });
    const later = { ...draftFromEvent(base, AUTUMN), startMinutes: 16 * 60, endMinutes: 17 * 60 };
    const payload = toCalendarEventPayload(later, base);
    expect(payload.id).toBe('otm-note-1');
    expect(payload.userId).toBe('otm-user');
    expect(payload.documentState).toBe('ACTIVE');
    expect(payload.startTime).toBe('2026-10-20T16:00');
    expect(payload.exceptions).toEqual(['2026-10-27', '2026-11-10']);
  });

  test('drops exceptions that no longer match after moving the note to another weekday', () => {
    const base = event({ recursEvery: 'WEEKLY', recursUntil: '2026-11-24', exceptions: ['2026-10-27'] });
    const moved = { ...draftFromEvent(base, AUTUMN), dateKey: '2026-10-21' };
    expect(toCalendarEventPayload(moved, base).exceptions).toEqual([]);
  });
});

describe('deleting one day', () => {
  test('addException dedupes and sorts', () => {
    expect(addException(event({ exceptions: ['2026-11-10'] }), '2026-10-27').exceptions).toEqual([
      '2026-10-27',
      '2026-11-10',
    ]);
    expect(addException(event({ exceptions: ['2026-10-27'] }), '2026-10-27').exceptions).toEqual(['2026-10-27']);
  });

  test('a one-off note is deleted outright', () => {
    expect(deleteDayAction(event(), '2026-10-20')).toEqual({ type: 'delete', noteId: 'otm-note-1' });
  });

  test('a day inside a series becomes an exception', () => {
    const weekly = event({ recursEvery: 'WEEKLY', recursUntil: '2026-11-03' });
    const action = deleteDayAction(weekly, '2026-10-27');
    expect(action.type).toBe('update');
    expect(action.type === 'update' ? action.event.exceptions : []).toEqual(['2026-10-27']);
  });

  test('removing the last remaining day deletes the series', () => {
    const weekly = event({ recursEvery: 'WEEKLY', recursUntil: '2026-10-27', exceptions: ['2026-10-20'] });
    expect(deleteDayAction(weekly, '2026-10-27')).toEqual({ type: 'delete', noteId: 'otm-note-1' });
  });
});

describe('note drafts', () => {
  const valid = { ...newNoteDraft('2026-10-21', 600, 660, AUTUMN), title: 'Dentist' };

  test('a complete draft has no errors', () => {
    expect(validateNoteDraft(valid)).toEqual({});
    expect(hasErrors(validateNoteDraft(valid))).toBe(false);
  });

  test('needs a title and an end after the start on the same day', () => {
    expect(validateNoteDraft({ ...valid, title: '   ' }).title).toBe('required');
    expect(validateNoteDraft({ ...valid, endMinutes: 600 }).time).toBe('endBeforeStart');
    expect(validateNoteDraft({ ...valid, startMinutes: 23 * 60, endMinutes: 0 }).time).toBe('endBeforeStart');
  });

  test('checks the until date only for repeating notes', () => {
    const weekly = { ...valid, repeat: 'WEEKLY' as const };
    expect(validateNoteDraft({ ...weekly, untilKey: '2026-10-20' }).until).toBe('beforeDate');
    expect(validateNoteDraft({ ...weekly, untilKey: '2027-10-21' }).until).toBe('tooFar');
    expect(validateNoteDraft({ ...weekly, untilKey: '2027-10-20' }).until).toBeUndefined();
    expect(validateNoteDraft({ ...valid, untilKey: '2026-01-01' }).until).toBeUndefined();
  });

  test('until defaults to the end of the loaded range, never before the date, at most a year', () => {
    expect(defaultUntilKey('2026-10-20', AUTUMN)).toBe('2026-12-31');
    expect(defaultUntilKey('2027-02-01', AUTUMN)).toBe('2027-02-01');
    expect(defaultUntilKey('2026-08-01', { startKey: '2026-08-01', endKey: '2027-09-01' })).toBe('2027-07-31');
    expect(maxUntilKey('2026-10-21')).toBe('2027-10-20');
  });

  test('a draft from a saved event round-trips its series fields', () => {
    const base = event({ recursEvery: 'WEEKLY', recursUntil: '2026-11-24' });
    expect(draftFromEvent(base, AUTUMN)).toEqual({
      title: 'Study group',
      dateKey: '2026-10-20',
      startMinutes: 14 * 60,
      endMinutes: 15 * 60 + 30,
      repeat: 'WEEKLY',
      untilKey: '2026-11-24',
    });
  });
});

describe('noteChangeFor', () => {
  test('an edit updates the event it was opened with, even if that note is no longer loaded', () => {
    const base = event({ recursEvery: 'WEEKLY', recursUntil: '2026-11-24' });
    const change = noteChangeFor({ ...draftFromEvent(base, AUTUMN), title: 'Renamed' }, base, 'pending-1');
    expect(change.type).toBe('update');
    expect(change.type === 'update' ? [change.event.id, change.event.name] : []).toEqual(['otm-note-1', 'Renamed']);
  });

  test('a new draft becomes a create with the pending id', () => {
    const change = noteChangeFor({ ...newNoteDraft('2026-10-21', 600, 660, AUTUMN), title: 'Gym' }, null, 'pending-1');
    expect(change.type).toBe('create');
    expect(change.type === 'create' ? change.event.id : null).toBe('pending-1');
  });
});
