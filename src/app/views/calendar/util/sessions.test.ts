/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { buildSession } from '@/app/schedule/__fixtures__/buildSession';
import { findClashes, groupClashesBySession } from '@/app/schedule';
import { groupByWeek, seriesOf, sessionChips, sessionsInRange } from './sessions';

const series = [
  buildSession('a', '2026-10-27', 14, 16, { seriesId: 's', locationIds: ['r1'] }),
  buildSession('b', '2026-11-03', 14, 16, { seriesId: 's', locationIds: ['r2'] }),
  buildSession('c', '2026-11-04', 14, 16, { seriesId: 's', locationIds: ['r2'], cancelled: true }),
];

describe('session helpers', () => {
  test('filters by an exclusive date range', () => {
    expect(sessionsInRange(series, '2026-10-26', '2026-11-03').map((s) => s.id)).toEqual(['a']);
  });

  test('collects a series in start order', () => {
    expect(seriesOf('s', [...series].reverse()).map((s) => s.id)).toEqual(['a', 'b', 'c']);
  });

  test('groups consecutive sessions by ISO week', () => {
    expect(groupByWeek(series).map((group) => [group.week, group.sessions.length])).toEqual([
      [44, 1],
      [45, 2],
    ]);
  });
});

describe('sessionChips', () => {
  test('flags a room change against the previous session', () => {
    expect(sessionChips(series[1], series[0], undefined)).toEqual([{ type: 'roomChanged' }]);
  });

  test('flags cancellations first', () => {
    expect(sessionChips(series[2], series[1], undefined)).toEqual([{ type: 'cancelled' }]);
  });

  test('reports a full clash, or the longest partial overlap', () => {
    const full = [buildSession('x', '2026-10-27', 14, 16), buildSession('y', '2026-10-27', 14, 16)];
    expect(sessionChips(full[0], undefined, groupClashesBySession(findClashes(full)).get('x'))).toEqual([
      { type: 'clash' },
    ]);
    const partial = [buildSession('x', '2026-10-27', 14, 16), buildSession('y', '2026-10-27', 15, 17)];
    expect(sessionChips(partial[0], undefined, groupClashesBySession(findClashes(partial)).get('x'))).toEqual([
      { type: 'partialClash', minutes: 60 },
    ]);
  });
});
