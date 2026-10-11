/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { ALL_DATES } from './attendance';
import { pairKey, prunePlan, sessionDateKey } from './prune';
import type { AttendancePlan, PruneContext } from './types';

const EMPTY: AttendancePlan = { usual: {}, swaps: [], skips: [], dismissed: [] };
const A = 'se-a@2026-10-05#0';
const B = 'se-b@2026-10-08#0';
const NET = 'se-net@2026-10-05#0';

const context = (overrides: Partial<PruneContext> = {}): PruneContext => ({
  range: { startKey: '2026-08-01', endKey: '2027-01-01' },
  sessionIds: new Set([A, B, NET]),
  visibleGroupIds: new Set(['t1', 't2']),
  seriesKeys: new Set(['group:c:t1', 'group:c:net']),
  overlappingPairs: new Set([pairKey('group:c:t1', 'group:c:net')]),
  clashIds: new Set([`${A}|${NET}`]),
  ...overrides,
});

describe('sessionDateKey', () => {
  test('reads the date from a session id', () => {
    expect(sessionDateKey('se-1@2026-10-05#3')).toBe('2026-10-05');
    expect(sessionDateKey('linked-a_b-1@2026-10-05#0')).toBe('2026-10-05');
    expect(sessionDateKey('not-a-session')).toBeNull();
  });
});

describe('prunePlan', () => {
  test('keeps rules outside the loaded range', () => {
    const plan: AttendancePlan = {
      ...EMPTY,
      swaps: [{ fromSessionId: 'se-x@2027-02-01#0', toSessionId: 'se-y@2027-02-03#0' }],
      skips: [{ keepSeriesKey: 'group:c:z', skipSeriesKey: 'group:c:y', dateKey: '2027-02-01' }],
      dismissed: ['se-x@2027-02-01#0|se-z@2027-02-01#0'],
    };
    expect(prunePlan(plan, context())).toEqual(plan);
  });

  test('drops an in-range swap whose target vanished and keeps a valid one', () => {
    const valid = { fromSessionId: A, toSessionId: B };
    const plan = { ...EMPTY, swaps: [valid, { fromSessionId: A, toSessionId: 'se-gone@2026-10-06#0' }] };
    expect(prunePlan(plan, context()).swaps).toEqual([valid]);
  });

  test('drops usual groups that are no longer switched on', () => {
    expect(prunePlan({ ...EMPTY, usual: { ex: 't1', lab: 't9' } }, context()).usual).toEqual({ ex: 't1' });
  });

  test('drops dated skips that no longer overlap and keeps every-time skips from another term', () => {
    const overlapping = { keepSeriesKey: 'group:c:net', skipSeriesKey: 'group:c:t1', dateKey: '2026-10-05' };
    const stale = { keepSeriesKey: 'group:c:t1', skipSeriesKey: 'group:c:old', dateKey: '2026-10-05' };
    const otherTerm = { keepSeriesKey: 'group:c:spring', skipSeriesKey: 'group:c:t1', dateKey: ALL_DATES };
    const plan = { ...EMPTY, skips: [overlapping, stale, otherTerm] };
    expect(prunePlan(plan, context()).skips).toEqual([overlapping, otherTerm]);
  });

  test('drops every-time skips whose series are both here but no longer overlap', () => {
    const skip = { keepSeriesKey: 'group:c:net', skipSeriesKey: 'group:c:t1', dateKey: ALL_DATES };
    expect(prunePlan({ ...EMPTY, skips: [skip] }, context({ overlappingPairs: new Set() })).skips).toEqual([]);
  });

  test('drops dismissals for clashes that are gone and keeps prompt dismissals', () => {
    const plan = { ...EMPTY, dismissed: [`${A}|${NET}`, `${B}|${NET}`, 'prompt:ex'] };
    expect(prunePlan(plan, context()).dismissed).toEqual([`${A}|${NET}`, 'prompt:ex']);
  });
});
