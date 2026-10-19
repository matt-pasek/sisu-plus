/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';
import { makePeriod } from './__fixtures__/timeline';
import { getChartDomain, getGraduationX, getTermPoints } from './trajectoryTerms';

const a1 = makePeriod({ locator: 'a1', studyYear: 2026, termName: 'Autumn' });
const a2 = makePeriod({ locator: 'a2', studyYear: 2026, termName: 'Autumn', startDate: '2026-11-01' });
const s1 = makePeriod({ locator: 's1', studyYear: 2026, termName: 'Spring', startDate: '2027-01-01' });
const s2 = makePeriod({ locator: 's2', studyYear: 2026, termName: 'Spring', startDate: '2027-03-01' });
const byLocator = new Map([a1, a2, s1, s2].map((period) => [period.locator, period]));

describe('getTermPoints', () => {
  test('groups periods into terms and keeps the last point of each', () => {
    const points = getTermPoints(
      [
        { periodLocator: 'a1', completed: 0, total: 10, hasStarted: true },
        { periodLocator: 'a2', completed: 0, total: 20, hasStarted: false },
        { periodLocator: 's1', completed: 0, total: 30, hasStarted: false },
        { periodLocator: 's2', completed: 0, total: 40, hasStarted: false },
        { periodLocator: 'missing', completed: 0, total: 99, hasStarted: false },
      ],
      byLocator,
    );
    expect(points).toHaveLength(2);
    expect(points.map((point) => point.total)).toEqual([20, 40]);
    expect(points[0].period.locator).toBe('a2');
    expect(points[0].hasStarted).toBe(true);
    expect(points[1].hasStarted).toBe(false);
  });
});

describe('getChartDomain', () => {
  test('pads below the first total and above the target', () => {
    const { min, max } = getChartDomain([76, 120, 181], 180);
    expect(max).toBeCloseTo(188.24);
    expect(min).toBeCloseTo(59.164);
  });

  test('falls back for empty totals', () => {
    expect(getChartDomain([], 180)).toEqual({ min: 0, max: 180 });
  });
});

describe('getGraduationX', () => {
  test('interpolates the crossing', () => {
    expect(
      getGraduationX(
        [
          { x: 0, total: 171 },
          { x: 100, total: 181 },
        ],
        180,
      ),
    ).toBeCloseTo(90);
  });

  test('is null when the target is never reached', () => {
    expect(getGraduationX([{ x: 0, total: 10 }], 180)).toBeNull();
  });

  test('returns the first x when already above', () => {
    expect(getGraduationX([{ x: 5, total: 200 }], 180)).toBe(5);
  });
});
