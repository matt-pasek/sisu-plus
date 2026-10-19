/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { buildSession } from '@/app/schedule/__fixtures__/buildSession';
import { groupBlock, lanesThatFit, splitOverlaps } from './overlapGroups';

const DAY = '2026-11-19';

describe('splitOverlaps', () => {
  test('pulls overlapping sessions into one group and leaves the rest single', () => {
    const { singles, groups } = splitOverlaps([
      buildSession('net', DAY, 10, 12),
      buildSession('fin', DAY, 10, 12),
      buildSession('chi', DAY, 14, 16),
    ]);
    expect(singles.map((session) => session.id)).toEqual(['chi']);
    expect(groups.map((group) => group.map((session) => session.id))).toEqual([['net', 'fin']]);
  });

  test('a day without overlaps has no groups', () => {
    const { singles, groups } = splitOverlaps([buildSession('a', DAY, 8, 10), buildSession('b', DAY, 10, 12)]);
    expect(singles).toHaveLength(2);
    expect(groups).toEqual([]);
  });
});

describe('groupBlock', () => {
  test('spans from the earliest start to the latest end', () => {
    const block = groupBlock([buildSession('a', DAY, 10, 12), buildSession('b', DAY, 11, 13)]);
    expect(block.start).toEqual(buildSession('a', DAY, 10, 12).start);
    expect(block.end).toEqual(buildSession('b', DAY, 11, 13).end);
    expect(block.dateKey).toBe(DAY);
    expect(block.id).toBe('group:a|b');
  });
});

describe('lanesThatFit', () => {
  test('a week column fits one readable lane, so two overlapping classes merge', () => {
    expect(lanesThatFit(170)).toBe(1);
  });

  test('a wide week column fits two lanes side by side', () => {
    expect(lanesThatFit(277)).toBe(2);
  });

  test('a day column fits plenty', () => {
    expect(lanesThatFit(880)).toBe(7);
  });
});
