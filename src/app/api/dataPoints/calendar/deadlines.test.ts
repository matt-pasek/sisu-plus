/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { parseIcsCalendar } from '@ts-ics/schema-zod';
import { helsinkiMinutesOfDay } from '@/app/schedule';
import { MOODLE_FEED } from './__fixtures__/moodle.fixture';
import { deadlineCourses, matchDeadlineCourse, safeHttpUrl, toCalendarDeadlines } from './deadlines';
import type { CalendarCourse } from './types';

const AUTUMN = { startKey: '2026-08-01', endKey: '2027-01-01' };
const COURSES = [
  { code: 'CT60A4304', name: 'Software Testing', colorIndex: 3 },
  { code: 'CT60A43', name: 'Short Code Course', colorIndex: 5 },
];
const events = parseIcsCalendar(MOODLE_FEED).events ?? [];

describe('matchDeadlineCourse', () => {
  test('finds a course code inside the Moodle category, any case', () => {
    expect(matchDeadlineCourse('ct60a4304_12.09.2026', COURSES)?.name).toBe('Software Testing');
  });

  test('a shorter code never matches inside a longer one', () => {
    expect(matchDeadlineCourse('CT60A4304', [COURSES[1]])).toBeNull();
  });

  test('no category or no match gives null', () => {
    expect(matchDeadlineCourse(null, COURSES)).toBeNull();
    expect(matchDeadlineCourse('Course without a Sisu match', COURSES)).toBeNull();
  });
});

describe('toCalendarDeadlines', () => {
  const deadlines = toCalendarDeadlines(events, COURSES, AUTUMN);

  test('keeps deadlines inside the range, sorted, with Helsinki days', () => {
    expect(deadlines.map((deadline) => deadline.dateKey)).toEqual(['2026-10-23', '2026-10-26', '2026-10-30']);
    expect(helsinkiMinutesOfDay(deadlines[0].dueAt)).toBe(23 * 60 + 59);
    expect(helsinkiMinutesOfDay(deadlines[1].dueAt)).toBe(23 * 60 + 59);
    expect(helsinkiMinutesOfDay(deadlines[2].dueAt)).toBe(0);
  });

  test('takes the course colour and name when matched, the category otherwise', () => {
    expect(deadlines[0]).toMatchObject({ title: 'Report 2 is due', courseLabel: 'Software Testing', colorIndex: 3 });
    expect(deadlines[1]).toMatchObject({ courseLabel: 'Course without a Sisu match', colorIndex: null });
  });

  test('keeps only http(s) links', () => {
    expect(deadlines[0].url).toBe('https://moodle.example.fi/mod/assign/view.php?id=1');
    expect(deadlines[2].url).toBeNull();
    expect(safeHttpUrl('javascript:alert(1)')).toBeNull();
    expect(safeHttpUrl('not a url')).toBeNull();
  });
});

describe('deadlineCourses', () => {
  test('uses the course unit code and skips courses without one', () => {
    const course = (realisationId: string, courseUnitId: string | null): CalendarCourse => ({
      realisationId,
      courseUnitId,
      enrolmentId: null,
      name: `Course ${realisationId}`,
      realisationName: 'Teaching',
      colorIndex: 2,
      isInCalendar: true,
      isExam: false,
      groupSets: [],
    });
    const units = { cu1: { id: 'cu1', code: 'CT60A4304', credits: 5, name: null } };
    expect(deadlineCourses([course('a', 'cu1'), course('b', null)], units)).toEqual([
      { code: 'CT60A4304', name: 'Course a', colorIndex: 2 },
    ]);
  });
});
