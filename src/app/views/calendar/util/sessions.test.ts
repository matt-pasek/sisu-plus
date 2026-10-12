/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { buildNote } from '@/app/schedule/__fixtures__/buildNote';
import { buildSession } from '@/app/schedule/__fixtures__/buildSession';
import { findClashes, groupClashesBySession, seriesKeyOf } from '@/app/schedule';
import { groupByWeek, seriesOf, sessionBadges, sessionChips, sessionsInRange, sessionsOnDay } from './sessions';

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
    expect(seriesOf(seriesKeyOf(series[0]), [...series].reverse()).map((s) => s.id)).toEqual(['a', 'b', 'c']);
  });

  test('collects weekly study events of one subgroup as one series', () => {
    const weekly = ['2026-10-05', '2026-10-12', '2026-10-19'].map((day, index) =>
      buildSession(`w${index}`, day, 14, 16, { seriesId: `se-${index}`, courseKey: 'cur', groupId: 'sub-lec' }),
    );
    expect(seriesOf(seriesKeyOf(weekly[1]), weekly).map((s) => s.id)).toEqual(['w0', 'w1', 'w2']);
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

describe('badges', () => {
  const skipped = buildSession('s', '2026-10-05', 14, 16);

  test('marks swapped, unavailable and skipped sessions, skipping first', () => {
    const badges = sessionBadges([skipped], new Set(['in', 's']), new Set(['gone']));
    expect(badges.get('in')).toBe('swapped');
    expect(badges.get('gone')).toBe('swapUnavailable');
    expect(badges.get('s')).toBe('skipping');
  });

  test('puts the badge chip before the other chips', () => {
    const cancelled = { ...skipped, cancelled: true };
    expect(sessionChips(cancelled, undefined, undefined, 'skipping').map((chip) => chip.type)).toEqual([
      'skipping',
      'cancelled',
    ]);
  });
});

describe('sessionsOnDay', () => {
  test('filters any dated block, notes included', () => {
    const notes = [buildNote('a', '2026-10-27', 9, 10), buildNote('b', '2026-10-28', 9, 10)];
    expect(sessionsOnDay(notes, '2026-10-27').map((note) => note.noteId)).toEqual(['a']);
  });
});
