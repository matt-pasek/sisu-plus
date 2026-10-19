/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { helsinkiMinutesOfDay } from '@/app/schedule';
import { FIXTURE_RANGE } from './__fixtures__/calendarRows.fixture';
import { TIMEEDIT_FEED } from './__fixtures__/timeedit.fixture';
import { importTimetable, mapLinkedSessions, shownLinkedSessions } from './mapLinkedTimetable';
import type { CalendarCourse } from './types';

const course: CalendarCourse = {
  realisationId: 'lab-cur-42901',
  courseUnitId: 'cu-fin5',
  enrolmentId: 'enr-fin5',
  name: 'Finnish 5 - Finnish for Work',
  realisationName: 'Online teaching P1&2, K200DK03-3003',
  colorIndex: 4,
  isInCalendar: true,
  isExam: false,
  groupSets: [],
};

describe('linked timetable mapping', () => {
  test('parses a TimeEdit feed into linked sessions at 12.00 Finnish time', () => {
    const imported = importTimetable(TIMEEDIT_FEED, 'K200DK03');
    expect(imported?.items).toHaveLength(2);
    const sessions = imported ? mapLinkedSessions(course, imported, FIXTURE_RANGE) : [];
    expect(sessions.map((session) => helsinkiMinutesOfDay(session.start))).toEqual([720, 720]);
    expect(sessions[0]).toMatchObject({
      courseKey: 'lab-cur-42901',
      courseUnitId: 'cu-fin5',
      groupId: 'linked:lab-cur-42901',
      groupIds: [],
      source: 'linked',
      locationText: null,
      kind: 'lecture',
      colorIndex: 4,
    });
  });

  test('reads floating times as Finnish local time', () => {
    const feed = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//test//EN',
      'BEGIN:VEVENT',
      'UID:floating-1',
      'DTSTAMP:20261001T000000Z',
      'DTSTART:20261005T120000',
      'DTEND:20261005T140000',
      'SUMMARY:Finnish 5',
      'END:VEVENT',
      'BEGIN:VEVENT',
      'UID:floating-2',
      'DTSTAMP:20261001T000000Z',
      'DTSTART:20261102T120000',
      'DTEND:20261102T140000',
      'SUMMARY:Finnish 5',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
    const imported = importTimetable(feed, null);
    const sessions = imported ? mapLinkedSessions(course, imported, FIXTURE_RANGE) : [];
    expect(sessions.map((session) => helsinkiMinutesOfDay(session.start))).toEqual([720, 720]);
    expect(sessions.map((session) => helsinkiMinutesOfDay(session.end))).toEqual([840, 840]);
  });

  test('shows no linked sessions for a hidden course', () => {
    const imported = importTimetable(TIMEEDIT_FEED, 'K200DK03');
    expect(imported && shownLinkedSessions(course, imported, FIXTURE_RANGE)).toHaveLength(2);
    expect(imported && shownLinkedSessions({ ...course, isInCalendar: false }, imported, FIXTURE_RANGE)).toEqual([]);
  });

  test('returns null for text that is not a calendar', () => {
    expect(importTimetable('<!doctype html><html></html>', null)).toBeNull();
  });
});
