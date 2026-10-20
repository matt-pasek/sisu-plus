/// <reference types="bun-types" />
import { describe, expect, test } from 'bun:test';
import { makePeriod } from './__fixtures__/timeline';
import { getLoadChart, getPeriodTick } from './loadChart';

const autumn1 = makePeriod({ locator: 'a1', name: '1. period', startDate: '2026-08-31', studyYear: 2026 });
const autumn2 = makePeriod({ locator: 'a2', name: '2. period', startDate: '2026-10-26', studyYear: 2026 });
const spring3 = makePeriod({ locator: 's3', name: '3. period', startDate: '2027-01-01', studyYear: 2026 });

describe('getPeriodTick', () => {
  test('uses the leading period number, or the first letter for unnumbered periods', () => {
    expect(getPeriodTick('2. period')).toBe('2');
    expect(getPeriodTick('4. periodi')).toBe('4');
    expect(getPeriodTick('Summer')).toBe('S');
  });
});

describe('getLoadChart', () => {
  const loads = [
    { period: autumn1, credits: 14.5 },
    { period: autumn2, credits: 23.5 },
    { period: spring3, credits: 13 },
  ];

  test('groups consecutive periods by term, in order', () => {
    const chart = getLoadChart(loads, 12.3);
    expect(chart.groups.map((group) => [group.term, group.bars.map((bar) => bar.tick)])).toEqual([
      [{ season: 'autumn', year: 2026 }, ['1', '2']],
      [{ season: 'spring', year: 2027 }, ['3']],
    ]);
  });

  test('scales bars to the heaviest period with headroom and marks only that one', () => {
    const bars = getLoadChart(loads, 12.3).groups.flatMap((group) => group.bars);
    const heaviest = bars.find((bar) => bar.isHeaviest);
    expect(bars.filter((bar) => bar.isHeaviest)).toHaveLength(1);
    expect(heaviest?.locator).toBe('a2');
    expect(heaviest?.ratio).toBeLessThan(1);
    expect(heaviest?.ratio).toBeGreaterThan(0.85);
    expect(bars[2].ratio).toBeCloseTo((13 / 23.5) * heaviest!.ratio);
  });

  test('places the needed line on the same scale, and keeps it inside when it is the tallest thing', () => {
    expect(getLoadChart(loads, 12.3).neededRatio).toBeCloseTo((12.3 / 23.5) * 0.9);
    const steep = getLoadChart(loads, 40).neededRatio ?? 0;
    expect(steep).toBeLessThan(1);
    expect(steep).toBeGreaterThan(0.85);
  });

  test('has no needed line without a target, and an empty plan draws nothing', () => {
    expect(getLoadChart(loads, null).neededRatio).toBeNull();
    expect(getLoadChart([], 10)).toEqual({ groups: [], neededRatio: null });
  });
});
