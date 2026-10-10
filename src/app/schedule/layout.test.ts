/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { buildSession } from './__fixtures__/buildSession';
import { layoutDay, visibleHourRange } from './layout';

const DAY = '2026-10-27';

describe('layoutDay', () => {
  test('puts overlapping sessions side by side', () => {
    const { placements } = layoutDay([buildSession('a', DAY, 14, 16), buildSession('b', DAY, 14, 16)]);
    expect(placements.a).toEqual({ col: 0, cols: 2 });
    expect(placements.b).toEqual({ col: 1, cols: 2 });
  });

  test('gives sequential sessions the full width', () => {
    const { placements } = layoutDay([buildSession('a', DAY, 8, 10), buildSession('b', DAY, 10, 12)]);
    expect(placements.a).toEqual({ col: 0, cols: 1 });
    expect(placements.b).toEqual({ col: 0, cols: 1 });
  });

  test('reuses a freed column inside a chained cluster', () => {
    const { placements } = layoutDay([
      buildSession('a', DAY, 10, 12),
      buildSession('b', DAY, 11, 13),
      buildSession('c', DAY, 12, 14),
    ]);
    expect(placements.a).toEqual({ col: 0, cols: 2 });
    expect(placements.b).toEqual({ col: 1, cols: 2 });
    expect(placements.c).toEqual({ col: 0, cols: 2 });
  });

  test('caps at three columns and reports the rest as overflow', () => {
    const layout = layoutDay(['a', 'b', 'c', 'd'].map((id) => buildSession(id, DAY, 14, 16)));
    expect(Object.keys(layout.placements)).toHaveLength(3);
    expect(Object.values(layout.placements).every((placement) => placement.cols === 3)).toBe(true);
    expect(layout.overflow).toHaveLength(1);
    expect(layout.overflow[0].sessionIds).toHaveLength(1);
  });
});

describe('visibleHourRange', () => {
  const fallback = { startHour: 8, endHour: 18 };

  test('keeps the default range when everything fits', () => {
    expect(visibleHourRange([buildSession('a', DAY, 10, 12)], fallback)).toEqual(fallback);
  });

  test('stretches for early and late sessions', () => {
    const sessions = [buildSession('a', DAY, 7.5, 9), buildSession('b', DAY, 19, 21)];
    expect(visibleHourRange(sessions, fallback)).toEqual({ startHour: 7, endHour: 21 });
  });

  test('a session ending at midnight reaches 24', () => {
    expect(visibleHourRange([buildSession('a', DAY, 22, 24)], fallback).endHour).toBe(24);
  });

  test('returns the fallback for an empty day', () => {
    expect(visibleHourRange([], fallback)).toEqual(fallback);
  });
});
