/// <reference types="bun-types" />
import { describe, expect, test } from 'bun:test';
import type { StudyPeriodInfo } from '@/app/api/dataPoints/getStudyPeriodMap';
import { makePeriod } from './__fixtures__/timeline';
import {
  getAveragePace,
  getHeaviestPeriod,
  getNeededPerPeriod,
  getPlanSpan,
  getRemainingPeriods,
  roundCredits,
} from './heroPace';

const summary = (period: StudyPeriodInfo, completedCredits: number, plannedCredits: number) => ({
  periodLocator: period.locator,
  period,
  completedCredits,
  plannedCredits,
  courses: [],
});

const p1 = makePeriod({ locator: 'p1', startDate: '2026-09-01', endDate: '2026-10-25' });
const p2 = makePeriod({ locator: 'p2', startDate: '2026-10-26', endDate: '2026-12-31' });
const summer = makePeriod({
  locator: 'summer',
  startDate: '2027-06-01',
  endDate: '2027-07-31',
  visibleByDefault: false,
});
const p3 = makePeriod({ locator: 'p3', startDate: '2027-08-31', endDate: '2027-10-25', studyYear: 2027 });
const p4 = makePeriod({ locator: 'p4', startDate: '2027-10-26', endDate: '2027-12-31', studyYear: 2027 });

describe('roundCredits', () => {
  test('keeps one decimal and never shows float noise', () => {
    expect(roundCredits(10.444)).toBe(10.4);
    expect(roundCredits(0.1 + 0.2)).toBe(0.3);
    expect(roundCredits(12)).toBe(12);
  });
});

describe('getPlanSpan', () => {
  test('runs from the first to the last period that holds any credits', () => {
    const span = getPlanSpan([summary(p1, 0, 0), summary(p2, 5, 0), summary(p3, 0, 6), summary(p4, 0, 0)]);
    expect(span?.from.locator).toBe('p2');
    expect(span?.to.locator).toBe('p3');
  });

  test('is null for an empty plan', () => {
    expect(getPlanSpan([summary(p1, 0, 0)])).toBeNull();
  });
});

describe('getRemainingPeriods', () => {
  const sorted = [summary(p1, 5, 0), summary(p2, 0, 10), summary(summer, 0, 0), summary(p3, 0, 6), summary(p4, 0, 0)];

  test('counts unfinished periods up to the end of the plan and skips empty hidden summers', () => {
    expect(getRemainingPeriods(sorted, '2026-11-15', 'p3').map((s) => s.periodLocator)).toEqual(['p2', 'p3']);
  });

  test('keeps a hidden summer period once something is planned in it', () => {
    const withSummer = sorted.map((s) => (s.periodLocator === 'summer' ? { ...s, plannedCredits: 3 } : s));
    expect(getRemainingPeriods(withSummer, '2026-11-15', 'p3').map((s) => s.periodLocator)).toEqual([
      'p2',
      'summer',
      'p3',
    ]);
  });

  test('a period that ends today is already behind you', () => {
    expect(getRemainingPeriods(sorted, '2026-12-31', 'p3').map((s) => s.periodLocator)).toEqual(['p3']);
  });

  test('is empty when the plan ended in the past or has no end', () => {
    expect(getRemainingPeriods(sorted, '2028-01-05', 'p3')).toEqual([]);
    expect(getRemainingPeriods(sorted, '2026-11-15', null)).toEqual([]);
  });
});

describe('getHeaviestPeriod', () => {
  test('ignores finished periods and breaks ties toward the earlier one', () => {
    const sorted = [summary(p1, 0, 30), summary(p2, 0, 10), summary(p3, 0, 10)];
    const heaviest = getHeaviestPeriod(sorted, '2026-11-15');
    expect(heaviest?.period.locator).toBe('p2');
    expect(heaviest?.credits).toBe(10);
  });

  test('is null when nothing is planned ahead', () => {
    expect(getHeaviestPeriod([summary(p1, 5, 0)], '2026-09-15')).toBeNull();
  });
});

describe('getAveragePace', () => {
  test('averages the planned credits over the remaining periods', () => {
    expect(getAveragePace([summary(p2, 0, 10), summary(p3, 0, 6), summary(p4, 0, 15.25)])).toBe(10.4);
  });

  test('is null with nothing left', () => {
    expect(getAveragePace([])).toBeNull();
  });
});

describe('getNeededPerPeriod', () => {
  test('spreads the missing credits over the remaining periods and rounds up', () => {
    expect(getNeededPerPeriod(180, 82, 9)).toBe(10.9);
  });

  test('is null without a target, without periods left, or once the target is met', () => {
    expect(getNeededPerPeriod(null, 82, 9)).toBeNull();
    expect(getNeededPerPeriod(180, 82, 0)).toBeNull();
    expect(getNeededPerPeriod(180, 180, 3)).toBeNull();
  });
});
