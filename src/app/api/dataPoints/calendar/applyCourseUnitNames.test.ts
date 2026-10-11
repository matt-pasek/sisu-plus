/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { buildSession } from '@/app/schedule/__fixtures__/buildSession';
import { applyCourseUnitNames } from './applyCourseUnitNames';
import type { CalendarCourse, CalendarRowsResult } from './types';

const course = (overrides: Partial<CalendarCourse>): CalendarCourse => ({
  realisationId: 'cur-chn',
  courseUnitId: 'cu-chn',
  enrolmentId: 'enr-chn',
  name: 'Contact teaching, Lahti',
  realisationName: 'Contact teaching, Lahti',
  colorIndex: 2,
  isInCalendar: true,
  isExam: false,
  groupSets: [],
  ...overrides,
});

const rows: CalendarRowsResult = {
  sessions: [
    buildSession('a', '2026-10-05', 14, 16, { courseUnitId: 'cu-chn', courseName: 'Contact teaching, Lahti' }),
    buildSession('b', '2026-10-06', 10, 12, { courseUnitId: 'cu-unknown', courseName: 'Blended teaching, Lahti' }),
  ],
  courses: [
    course({}),
    course({
      realisationId: 'cur-x',
      courseUnitId: 'cu-unknown',
      name: 'Blended teaching, Lahti',
      realisationName: 'Blended teaching, Lahti',
    }),
  ],
};

const units = { 'cu-chn': { id: 'cu-chn', code: 'HDD7010', credits: 5, name: 'Basic Chinese 1 (HDD)' } };

describe('applyCourseUnitNames', () => {
  test('titles sessions and courses with the course unit name', () => {
    const named = applyCourseUnitNames(rows, units);
    expect(named.sessions[0].courseName).toBe('Basic Chinese 1 (HDD)');
    expect(named.courses[0].name).toBe('Basic Chinese 1 (HDD)');
  });

  test('keeps the implementation name for the secondary line', () => {
    expect(applyCourseUnitNames(rows, units).courses[0].realisationName).toBe('Contact teaching, Lahti');
  });

  test('keeps the implementation name when the course unit is unknown', () => {
    const named = applyCourseUnitNames(rows, units);
    expect(named.sessions[1].courseName).toBe('Blended teaching, Lahti');
    expect(named.courses[1].name).toBe('Blended teaching, Lahti');
  });

  test('sorts courses by their new names, non-exam first', () => {
    const exam = course({
      realisationId: 'cur-exam',
      isExam: true,
      name: 'Exam, Lahti',
      realisationName: 'Exam, Lahti',
    });
    const named = applyCourseUnitNames({ ...rows, courses: [exam, ...rows.courses] }, units);
    expect(named.courses.map((entry) => entry.realisationId)).toEqual(['cur-chn', 'cur-x', 'cur-exam']);
  });
});
