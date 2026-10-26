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

  test('scheduled sums planned credits and projected adds them to what is already passed', () => {
    const stats = getHeroStats({ periods, courses: passed, target: 60, today: '2026-11-15' });
    expect(stats.scheduledCredits).toBe(28);
    expect(stats.projectedCredits).toBe(53);
    expect(stats.projectedPercent).toBe(88);
  });

  test('the span runs over the sorted periods that hold credits', () => {
    const stats = getHeroStats({ periods, courses: passed, target: 60, today: '2026-11-15' });
    expect(stats.span?.from.locator).toBe('p1');
    expect(stats.span?.to.locator).toBe('p3');
  });

  test('pace is what you earned per finished period; need uses the periods left', () => {
    const stats = getHeroStats({ periods, courses: passed, target: 60, today: '2026-11-15' });
    expect(stats.remainingPeriods).toBe(2);
    expect(stats.averagePace).toBe(5);
    expect(stats.paceKind).toBe('earned');
    expect(stats.neededPerPeriod).toBe(17.5);
    expect(stats.heaviest?.period.locator).toBe('p2');
  });

  test('loads cover the whole plan in order and flag the periods already behind you', () => {
    const stats = getHeroStats({ periods, courses: passed, target: 60, today: '2026-11-15' });
    expect(stats.loads.map((load) => [load.period.locator, load.credits, load.isPast])).toEqual([
      ['p1', 5, true],
      ['p2', 18, false],
      ['p3', 10, false],
    ]);
  });

  test("a period's load counts what is planned and what is already done there", () => {
    const stats = getHeroStats({ periods: [summary(p2, 4, 6)], courses: passed, target: 60, today: '2026-11-15' });
    expect(stats.loads.map((load) => load.credits)).toEqual([10]);
  });

  test('the outlook counts credits earned outside the period map', () => {
    expect(getHeroStats({ periods, courses: passed, target: 43, today: '2026-11-15' }).outlook).toEqual({
      kind: 'graduating',
      period: p2,
    });
    expect(getHeroStats({ periods, courses: passed, target: 60, today: '2026-11-15' }).outlook).toEqual({
      kind: 'short',
      credits: 7,
      endsIn: p3,
    });
  });

  test('without a target there is no percentage and no need per period', () => {
    const stats = getHeroStats({ periods, courses: passed, target: null, today: '2026-11-15' });
    expect(stats.projectedPercent).toBeNull();
    expect(stats.neededPerPeriod).toBeNull();
    expect(stats.outlook).toEqual({ kind: 'open', endsIn: p3 });
  });

  test('an empty plan and null credits never produce NaN', () => {
    const stats = getHeroStats({
      periods: [summary(p1, 0, 0)],
      courses: [makeCourse({ courseUnitId: 'x', isPassed: true, credits: null })],
      target: 180,
      today: '2026-11-15',
    });
    expect(stats).toMatchObject({
      outlook: { kind: 'empty' },
      span: null,
      scheduledCredits: 0,
      projectedCredits: 0,
      projectedPercent: 0,
      remainingPeriods: 0,
      loads: [],
      heaviest: null,
      averagePace: null,
      neededPerPeriod: null,
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

describe('getHeroStats pace fallback', () => {
  test('before any period has ended, pace falls back to what is planned ahead', () => {
    const periods = [summary(p1, 0, 10), summary(p2, 0, 20)];
    const stats = getHeroStats({ periods, courses: [], target: 60, today: '2026-09-10' });
    expect(stats.averagePace).toBe(15);
    expect(stats.paceKind).toBe('planned');
  });
});
