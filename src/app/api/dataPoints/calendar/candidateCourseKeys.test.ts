/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { buildSession } from '@/app/schedule/__fixtures__/buildSession';
import { findClashes } from '@/app/schedule';
import { candidateCourseKeys } from './candidateCourseKeys';
import type { CalendarCourse } from './types';

const course = (realisationId: string): CalendarCourse => ({
  realisationId,
  courseUnitId: null,
  enrolmentId: null,
  name: realisationId,
  realisationName: realisationId,
  colorIndex: 0,
  isInCalendar: true,
  isExam: false,
  groupSets: [],
});

const COURSES = [course('cur-a'), course('cur-b'), course('cur-c'), course('cur-d')];
const grouped = buildSession('a-mon', '2026-10-05', 14, 16, { courseKey: 'cur-a', groupId: 'g', groupIds: ['g'] });
const ungrouped = buildSession('b-mon', '2026-10-05', 15, 16, { courseKey: 'cur-b' });
const plans = { 'cur-c': { usual: {}, swaps: [{ fromSessionId: 'x', toSessionId: 'y' }], skips: [], dismissed: [] } };

describe('candidateCourseKeys', () => {
  test('combines requested courses, courses with swaps and grouped clashing courses', () => {
    const attended = [grouped, ungrouped];
    expect(candidateCourseKeys(COURSES, plans, attended, findClashes(attended), ['cur-d'])).toEqual([
      'cur-a',
      'cur-c',
      'cur-d',
    ]);
  });

  test('ignores unknown courses and exam clashes', () => {
    const exam = { ...grouped, kind: 'exam' as const };
    expect(candidateCourseKeys(COURSES, {}, [exam, ungrouped], findClashes([exam, ungrouped]), ['cur-zzz'])).toEqual(
      [],
    );
  });
});
