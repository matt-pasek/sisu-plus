/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { buildSession } from './__fixtures__/buildSession';
import { busyMinutes, dayShape } from './dayShape';

const DAY = '2026-10-27';

describe('busyMinutes', () => {
  test('adds separate sessions', () => {
    expect(busyMinutes([buildSession('a', DAY, 10, 12), buildSession('b', DAY, 14, 16)])).toBe(240);
  });

  test('counts overlapping and contained time once', () => {
    expect(busyMinutes([buildSession('a', DAY, 14, 16), buildSession('b', DAY, 15, 17)])).toBe(180);
    expect(busyMinutes([buildSession('a', DAY, 10, 14), buildSession('b', DAY, 11, 12)])).toBe(240);
  });

  test('is zero without sessions', () => {
    expect(busyMinutes([])).toBe(0);
  });
});

describe('dayShape', () => {
  test('places a session on the 08–19 strip at full height', () => {
    const [segment] = dayShape([buildSession('a', DAY, 10, 12, { colorIndex: 3 })], new Set());
    expect(segment.left).toBeCloseTo(2 / 11);
    expect(segment.width).toBeCloseTo(2 / 11);
    expect(segment).toMatchObject({ sessionId: 'a', colorIndex: 3, lane: 'full', clashing: false });
  });

  test('clamps sessions outside 08–19 and drops ones fully outside', () => {
    const segments = dayShape(
      [buildSession('early', DAY, 7, 9), buildSession('late', DAY, 18, 21), buildSession('night', DAY, 20, 21)],
      new Set(),
    );
    expect(segments.map((segment) => segment.sessionId)).toEqual(['early', 'late']);
    expect(segments[0].left).toBeCloseTo(0);
    expect(segments[0].width).toBeCloseTo(1 / 11);
    expect(segments[1].left + segments[1].width).toBeCloseTo(1);
  });

  test('splits overlapping sessions into two lanes, three or more included', () => {
    const lanes = dayShape(
      [buildSession('a', DAY, 14, 16), buildSession('b', DAY, 15, 17), buildSession('c', DAY, 15, 16)],
      new Set(['a', 'b']),
    );
    expect(lanes.map((segment) => [segment.sessionId, segment.lane, segment.clashing])).toEqual([
      ['a', 'top', true],
      ['b', 'bottom', true],
      ['c', 'bottom', false],
    ]);
  });

  test('a chain of overlaps reuses the top lane once it frees up', () => {
    const lanes = dayShape(
      [buildSession('a', DAY, 10, 12), buildSession('b', DAY, 11, 13), buildSession('c', DAY, 12, 14)],
      new Set(),
    );
    expect(lanes.map((segment) => [segment.sessionId, segment.lane])).toEqual([
      ['a', 'top'],
      ['b', 'bottom'],
      ['c', 'top'],
    ]);
  });

  test('keeps wall-clock positions on the day the clocks change', () => {
    const [segment] = dayShape([buildSession('dst', '2026-10-25', 10, 12)], new Set());
    expect(segment.left).toBeCloseTo(2 / 11);
    expect(segment.width).toBeCloseTo(2 / 11);
  });
});
