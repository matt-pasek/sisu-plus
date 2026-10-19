/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';
import type { StudyPeriodInfo } from '@/app/api/dataPoints/getStudyPeriodMap';
import { makeCourse, makePeriod } from './__fixtures__/timeline';
import { getDegreeTarget, getHeroStats } from './heroStats';

const p1 = makePeriod({ locator: 'p1', startDate: '2026-09-01', endDate: '2026-10-31' });
const p2 = makePeriod({ locator: 'p2', startDate: '2026-11-01', endDate: '2026-12-31' });
const p3 = makePeriod({ locator: 'p3', startDate: '2027-01-01', endDate: '2027-03-01' });
const summary = (period: StudyPeriodInfo, completedCredits: number, plannedCredits: number) => ({
  periodLocator: period.locator,
  period,
  completedCredits,
  plannedCredits,
  courses: [],
});

describe('getHeroStats', () => {
  const periods = [summary(p3, 0, 10), summary(p1, 5, 0), summary(p2, 0, 18)];
  const passed = [
    makeCourse({ courseUnitId: 'old', isPassed: true, credits: 20 }),
    makeCourse({ courseUnitId: 'p1c', isPassed: true, credits: 5 }),
  ];

  test('scheduled sums planned credits', () => {
    expect(getHeroStats({ periods, courses: passed, target: 60, today: '2026-11-15' }).scheduledCredits).toBe(28);
  });

  test('heaviest ignores finished periods', () => {
    expect(getHeroStats({ periods, courses: passed, target: 60, today: '2027-01-05' }).heaviest?.period.locator).toBe(
      'p3',
    );
  });

  test('heaviest breaks ties toward the earlier period', () => {
    const tied = [summary(p3, 0, 10), summary(p2, 0, 10)];
    const heaviest = getHeroStats({ periods: tied, courses: [], target: null, today: '2026-11-15' }).heaviest;
    expect(heaviest?.credits).toBe(10);
    expect(heaviest?.period.locator).toBe('p2');
  });

  test('trajectory is cumulative, sorted, and flags started periods', () => {
    expect(getHeroStats({ periods, courses: passed, target: 60, today: '2026-11-15' }).trajectory).toEqual([
      { periodLocator: 'p1', completed: 25, total: 25, hasStarted: true },
      { periodLocator: 'p2', completed: 25, total: 43, hasStarted: true },
      { periodLocator: 'p3', completed: 25, total: 53, hasStarted: false },
    ]);
  });

  test('graduation counts credits earned outside the period map', () => {
    expect(getHeroStats({ periods, courses: passed, target: 43, today: '2026-11-15' }).graduation).toEqual({
      kind: 'period',
      period: p2,
    });
  });

  test('short when the plan never reaches the target', () => {
    expect(getHeroStats({ periods, courses: passed, target: 60, today: '2026-11-15' }).graduation).toEqual({
      kind: 'short',
      credits: 7,
    });
  });

  test('no target, no estimate', () => {
    expect(getHeroStats({ periods, courses: passed, target: null, today: '2026-11-15' }).graduation).toBeNull();
  });

  test('empty plan and null credits never produce NaN', () => {
    const stats = getHeroStats({
      periods: [summary(p1, 0, 0)],
      courses: [makeCourse({ courseUnitId: 'x', isPassed: true, credits: null })],
      target: 180,
      today: '2026-11-15',
    });
    expect(stats).toMatchObject({
      scheduledCredits: 0,
      heaviest: null,
      graduation: { kind: 'short', credits: 180 },
      trajectory: [],
    });
  });
});

describe('getDegreeTarget', () => {
  test('degree minimum wins, then section minimums, else null', () => {
    expect(getDegreeTarget({ degreeMinimumCredits: 180, sections: [] })).toBe(180);
    expect(
      getDegreeTarget({
        degreeMinimumCredits: null,
        sections: [{ minimumCredits: 60 }, { minimumCredits: 120 }] as never,
      }),
    ).toBe(180);
    expect(getDegreeTarget({ degreeMinimumCredits: null, sections: [] })).toBeNull();
    expect(getDegreeTarget(undefined)).toBeNull();
  });
});
