/// <reference types="bun-types" />
import { describe, expect, test } from 'bun:test';
import type { StudyPeriodInfo } from '@/app/api/dataPoints/getStudyPeriodMap';
import { makePeriod } from './__fixtures__/timeline';
import { getGraduationOutlook } from './heroOutlook';

const summary = (period: StudyPeriodInfo, completedCredits: number, plannedCredits: number) => ({
  periodLocator: period.locator,
  period,
  completedCredits,
  plannedCredits,
  courses: [],
});

const p1 = makePeriod({ locator: 'p1', startDate: '2026-09-01', endDate: '2026-10-25' });
const p2 = makePeriod({ locator: 'p2', startDate: '2026-10-26', endDate: '2026-12-31' });
const p3 = makePeriod({ locator: 'p3', startDate: '2027-01-01', endDate: '2027-03-07' });
const sorted = [summary(p1, 5, 0), summary(p2, 0, 18), summary(p3, 0, 10)];
const today = '2026-11-15';

describe('getGraduationOutlook', () => {
  test('graduating in the first period where the running total reaches the target', () => {
    expect(getGraduationOutlook({ sorted, baseline: 20, target: 43, today })).toEqual({
      kind: 'graduating',
      period: p2,
    });
  });

  test('short by what the whole plan leaves missing, ending with the last planned period', () => {
    expect(getGraduationOutlook({ sorted, baseline: 20, target: 60, today })).toEqual({
      kind: 'short',
      credits: 7,
      endsIn: p3,
    });
  });

  test('met once the target was reached in a period that has already ended', () => {
    expect(getGraduationOutlook({ sorted, baseline: 20, target: 25, today })).toEqual({ kind: 'met' });
    expect(getGraduationOutlook({ sorted: [], baseline: 200, target: 180, today })).toEqual({ kind: 'met' });
  });

  test('open-ended without a target', () => {
    expect(getGraduationOutlook({ sorted, baseline: 20, target: null, today })).toEqual({ kind: 'open', endsIn: p3 });
  });

  test('empty when no period holds any credits', () => {
    expect(getGraduationOutlook({ sorted: [summary(p1, 0, 0)], baseline: 0, target: 180, today })).toEqual({
      kind: 'empty',
    });
    expect(getGraduationOutlook({ sorted: [], baseline: 12, target: null, today })).toEqual({ kind: 'empty' });
  });

  test('rounds the shortfall so split credits never print float noise', () => {
    const split = [summary(p2, 0, 0.1), summary(p3, 0, 0.2)];
    expect(getGraduationOutlook({ sorted: split, baseline: 0, target: 1, today })).toEqual({
      kind: 'short',
      credits: 0.7,
      endsIn: p3,
    });
  });
});
