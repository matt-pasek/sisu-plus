/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { buildSession } from '@/app/schedule/__fixtures__/buildSession';
import { fitHourHeight, placePopover, sessionBox } from './geometry';

describe('fitHourHeight', () => {
  const bounds = { min: 52, max: 120 };

  test('stretches hours to fill the available height', () => {
    expect(fitHourHeight(800, 10, bounds)).toBe(80);
  });

  test('never shrinks below the minimum, so short windows scroll', () => {
    expect(fitHourHeight(300, 10, bounds)).toBe(52);
  });

  test('caps tall windows at the maximum', () => {
    expect(fitHourHeight(2000, 10, bounds)).toBe(120);
  });

  test('falls back to the minimum before the panel is measured', () => {
    expect(fitHourHeight(0, 10, bounds)).toBe(52);
    expect(fitHourHeight(800, 0, bounds)).toBe(52);
  });
});

describe('sessionBox', () => {
  test('positions a session inside the visible hours', () => {
    const box = sessionBox(buildSession('a', '2026-10-27', 14, 16), { startHour: 8, endHour: 18 }, 48);
    expect(box).toEqual({ top: 288, height: 96 });
  });
});

describe('placePopover', () => {
  const viewport = { width: 1440, height: 900 };
  const size = { width: 372, height: 300 };

  test('opens to the right when it fits, centred on the anchor', () => {
    expect(placePopover({ top: 400, left: 500, right: 640, height: 100 }, size, viewport)).toEqual({
      top: 300,
      left: 652,
      side: 'right',
    });
  });

  test('flips to the left near the right edge', () => {
    const placement = placePopover({ top: 400, left: 1200, right: 1340, height: 100 }, size, viewport);
    expect(placement.side).toBe('left');
    expect(placement.left).toBe(816);
  });

  test('stays inside the viewport vertically', () => {
    expect(placePopover({ top: 860, left: 500, right: 640, height: 30 }, size, viewport).top).toBe(592);
    expect(placePopover({ top: 0, left: 500, right: 640, height: 30 }, size, viewport).top).toBe(8);
  });
});
