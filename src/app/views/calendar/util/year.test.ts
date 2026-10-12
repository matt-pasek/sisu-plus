/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { buildDeadline } from '@/app/api/dataPoints/calendar/__fixtures__/buildDeadline';
import { findClashes } from '@/app/schedule';
import { buildSession } from '@/app/schedule/__fixtures__/buildSession';
import type { YearInput } from '../types';
import {
  emptyFutureTerm,
  heaviestWeeks,
  loadLevel,
  monthBands,
  noTeachingBands,
  periodBands,
  plannedCourseCount,
  upcomingExams,
  yearWeeks,
} from './year';

const RANGE = { startKey: '2026-08-01', endKey: '2027-08-01' };

const input = (overrides: Partial<YearInput> = {}): YearInput => ({
  range: RANGE,
  todayKey: '2026-10-27',
  attended: [],
  clashes: [],
  holidays: [],
  deadlines: [],
  ...overrides,
});

const dayOf = (weeks: ReturnType<typeof yearWeeks>, dateKey: string) =>
  weeks.flatMap((week) => week.days).find((day) => day.dateKey === dateKey);

describe('loadLevel', () => {
  test('steps up every two hours', () => {
    expect([0, 60, 120, 121, 240, 360, 361].map(loadLevel)).toEqual([0, 1, 1, 2, 2, 3, 4]);
  });
});

describe('yearWeeks', () => {
  test('covers the academic year in weekday columns from Monday 27.7.2026', () => {
    const weeks = yearWeeks(input());
    expect(weeks).toHaveLength(53);
    expect(weeks[0].weekKey).toBe('2026-07-27');
    expect(weeks[0].days).toHaveLength(5);
  });

  test('days outside the academic year are not in the year', () => {
    const weeks = yearWeeks(input({ attended: [buildSession('july', '2026-07-28', 10, 12)] }));
    expect(dayOf(weeks, '2026-07-28')).toMatchObject({ inYear: false });
  });

  test('marks hours, exams, holidays and today', () => {
    const weeks = yearWeeks(
      input({
        attended: [
          buildSession('a', '2026-10-27', 10, 12),
          buildSession('b', '2026-10-27', 13, 16),
          buildSession('exam', '2026-12-02', 9, 12, { kind: 'exam' }),
        ],
        holidays: [{ dateKey: '2026-12-24', id: 'christmasEve' }],
      }),
    );
    expect(dayOf(weeks, '2026-10-27')).toMatchObject({ minutes: 300, level: 3, isToday: true });
    expect(dayOf(weeks, '2026-12-02')?.exam).toBe(true);
    expect(dayOf(weeks, '2026-12-24')?.holiday?.id).toBe('christmasEve');
    expect(weeks.find((week) => week.weekKey === '2026-10-26')?.isCurrent).toBe(true);
  });

  test('clash flag comes only from the clashes list', () => {
    const attended = [buildSession('a', '2026-11-23', 14, 16), buildSession('b', '2026-11-23', 15, 17)];
    expect(dayOf(yearWeeks(input({ attended })), '2026-11-23')?.clash).toBe(false);
    expect(dayOf(yearWeeks(input({ attended, clashes: findClashes(attended) })), '2026-11-23')?.clash).toBe(true);
  });
});

describe('bands', () => {
  const weeks = yearWeeks(input());

  test('spans a period over the weeks it touches', () => {
    expect(periodBands(weeks, [{ name: 'Period 1', startDate: '2026-08-31', endDate: '2026-10-26' }])).toEqual([
      { kind: 'period', label: 'Period 1', from: 5, to: 12 },
    ]);
  });

  test('merges consecutive no-teaching weeks', () => {
    expect(noTeachingBands(weeks, new Set(['2026-10-19', '2026-10-26', '2026-12-14']), 'No teaching')).toEqual([
      { kind: 'noTeaching', label: 'No teaching', from: 12, to: 13 },
      { kind: 'noTeaching', label: 'No teaching', from: 20, to: 20 },
    ]);
  });

  test('labels months by the Thursday of each week', () => {
    const months = monthBands(weeks, 'en');
    expect(months[0]).toEqual({ kind: 'month', label: 'Jul', from: 0, to: 0 });
    expect(months[1]).toMatchObject({ label: 'Aug', from: 1 });
  });
});

describe('footer helpers', () => {
  test('ranks the heaviest weeks', () => {
    const weeks = yearWeeks(
      input({
        attended: [
          buildSession('a', '2026-10-27', 8, 16),
          buildSession('b', '2026-11-03', 10, 12),
          buildSession('c', '2026-11-10', 10, 14),
        ],
      }),
    );
    expect(heaviestWeeks(weeks, 2).map((week) => [week.weekKey, week.minutes])).toEqual([
      ['2026-10-26', 480],
      ['2026-11-09', 240],
    ]);
  });

  test('lists exams from today on, or the whole year when today is outside it', () => {
    const exams = [
      buildSession('past', '2026-10-01', 9, 12, { kind: 'exam' }),
      buildSession('next', '2026-12-02', 9, 12, { kind: 'exam' }),
      buildSession('lecture', '2026-12-03', 9, 12),
    ];
    expect(upcomingExams(exams, '2026-10-27', RANGE).map((session) => session.id)).toEqual(['next']);
    expect(upcomingExams(exams, '2027-09-01', RANGE).map((session) => session.id)).toEqual(['past', 'next']);
  });

  test('emptyFutureTerm finds a later term without sessions', () => {
    const autumnOnly = [buildSession('a', '2026-10-27', 10, 12)];
    expect(emptyFutureTerm(RANGE, autumnOnly, '2026-10-27')).toEqual({ startKey: '2027-01-01', endKey: '2027-08-01' });
    expect(emptyFutureTerm(RANGE, [...autumnOnly, buildSession('s', '2027-02-01', 10, 12)], '2026-10-27')).toBeNull();
    expect(emptyFutureTerm(RANGE, autumnOnly, '2027-02-01')).toBeNull();
  });

  test('counts courses planned in a term that are not enrolled yet', () => {
    const spring = { startKey: '2027-01-01', endKey: '2027-08-01' };
    const period = (startDate: string, endDate: string) => ({
      locator: startDate,
      name: startDate,
      startDate,
      endDate,
      studyYear: 2026,
      termName: '',
      visibleByDefault: true,
    });
    const courses = [
      { isEnrolled: false, plannedPeriods: [period('2027-01-04', '2027-03-01')] },
      { isEnrolled: true, plannedPeriods: [period('2027-01-04', '2027-03-01')] },
      { isEnrolled: false, plannedPeriods: [period('2026-09-01', '2026-10-26')] },
    ];
    expect(plannedCourseCount(courses, spring)).toBe(1);
  });
});

describe('year deadlines', () => {
  test('counts deadlines per weekday cell inside the year', () => {
    const weeks = yearWeeks(
      input({
        deadlines: [
          buildDeadline('a', '2026-10-23', 23.98),
          buildDeadline('b', '2026-10-23', 12),
          buildDeadline('outside', '2027-08-03', 12),
        ],
      }),
    );
    const day = weeks.flatMap((week) => week.days).find((item) => item.dateKey === '2026-10-23');
    expect(day?.deadlines).toBe(2);
    expect(weeks.flatMap((week) => week.days).reduce((sum, item) => sum + item.deadlines, 0)).toBe(2);
  });
});
