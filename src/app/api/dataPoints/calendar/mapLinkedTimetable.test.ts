/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { helsinkiMinutesOfDay } from '@/app/schedule';
import { FIXTURE_RANGE } from './__fixtures__/calendarRows.fixture';
import { TIMEEDIT_FEED } from './__fixtures__/timeedit.fixture';
import { importTimetable, mapLinkedSessions } from './mapLinkedTimetable';
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

  test('returns null for text that is not a calendar', () => {
    expect(importTimetable('<!doctype html><html></html>', null)).toBeNull();
  });
});
