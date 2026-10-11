/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { ALL_DATES } from '@/app/schedule';
import {
  EMPTY_PLAN,
  isEmptyPlan,
  parsePlan,
  parsePlans,
  planKey,
  samePlan,
  withDismissed,
  withoutSkip,
  withoutSwap,
  withSkip,
  withSwap,
  withSwaps,
  withUsual,
} from './attendancePlan';

describe('parsing', () => {
  test('reads only plan keys and strips the prefix', () => {
    const plans = parsePlans({ [planKey('cur-1')]: { usual: { ex: 't1' } }, locale: 'en' });
    expect(Object.keys(plans)).toEqual(['cur-1']);
    expect(plans['cur-1'].usual).toEqual({ ex: 't1' });
  });

  test('drops malformed parts and keeps the rest', () => {
    const plan = parsePlan({
      usual: { ex: 't1', bad: 3 },
      swaps: [{ fromSessionId: 'a', toSessionId: 'b' }, { fromSessionId: 1 }],
      skips: 'nope',
      dismissed: ['x', 2],
    });
    expect(plan).toEqual({
      usual: { ex: 't1' },
      swaps: [{ fromSessionId: 'a', toSessionId: 'b' }],
      skips: [],
      dismissed: ['x'],
    });
    expect(parsePlan(null)).toEqual(EMPTY_PLAN);
    expect(parsePlan([1, 2])).toEqual(EMPTY_PLAN);
  });
});

describe('updaters', () => {
  test('a new swap replaces swaps that touch the same sessions', () => {
    const first = withSwap(EMPTY_PLAN, { fromSessionId: 'a', toSessionId: 'b' });
    const second = withSwap(first, { fromSessionId: 'a', toSessionId: 'c' });
    expect(second.swaps).toEqual([{ fromSessionId: 'a', toSessionId: 'c' }]);
    expect(first.swaps).toEqual([{ fromSessionId: 'a', toSessionId: 'b' }]);
  });

  test('adds several swaps and removes one by either side', () => {
    const plan = withSwaps(EMPTY_PLAN, [
      { fromSessionId: 'a', toSessionId: 'b' },
      { fromSessionId: 'c', toSessionId: 'd' },
    ]);
    expect(withoutSwap(plan, 'b').swaps).toEqual([{ fromSessionId: 'c', toSessionId: 'd' }]);
    expect(withoutSwap(plan, 'c').swaps).toEqual([{ fromSessionId: 'a', toSessionId: 'b' }]);
  });

  test('sets and clears a usual group', () => {
    const plan = withUsual(EMPTY_PLAN, 'ex', 't2');
    expect(plan.usual).toEqual({ ex: 't2' });
    expect(withUsual(plan, 'ex', null).usual).toEqual({});
  });

  test('a skip replaces the same pair and date in either order', () => {
    const first = withSkip(EMPTY_PLAN, { keepSeriesKey: 'net', skipSeriesKey: 't2', dateKey: '2026-10-05' });
    const flipped = withSkip(first, { keepSeriesKey: 't2', skipSeriesKey: 'net', dateKey: '2026-10-05' });
    expect(flipped.skips).toEqual([{ keepSeriesKey: 't2', skipSeriesKey: 'net', dateKey: '2026-10-05' }]);
  });

  test('undoing a skip removes the dated and every-time rules for that series', () => {
    const plan = withSkip(withSkip(EMPTY_PLAN, { keepSeriesKey: 'net', skipSeriesKey: 't2', dateKey: '2026-10-05' }), {
      keepSeriesKey: 'lab',
      skipSeriesKey: 't2',
      dateKey: ALL_DATES,
    });
    expect(withoutSkip(plan, 't2', '2026-10-05').skips).toEqual([]);
  });

  test('dismissing twice keeps one entry', () => {
    expect(withDismissed(withDismissed(EMPTY_PLAN, 'x'), 'x').dismissed).toEqual(['x']);
  });

  test('emptiness and equality', () => {
    expect(isEmptyPlan(EMPTY_PLAN)).toBe(true);
    expect(isEmptyPlan(withDismissed(EMPTY_PLAN, 'x'))).toBe(false);
    expect(samePlan(withUsual(EMPTY_PLAN, 'ex', 't1'), { ...EMPTY_PLAN, usual: { ex: 't1' } })).toBe(true);
  });
});
