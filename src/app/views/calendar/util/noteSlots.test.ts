/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { helsinkiMinutesOfDay, helsinkiWallTimeToInstant } from '@/app/schedule';
import { buildNote } from '@/app/schedule/__fixtures__/buildNote';
import { buildSession } from '@/app/schedule/__fixtures__/buildSession';
import { doubleClickTimes, dragTimes, nextFreeSlot, pointerToMinutes, slotBlock, slotInView } from './noteSlots';

const RANGE = { startHour: 8, endHour: 18 };
const DAY = '2026-10-27';
const at = (dateKey: string, minutes: number): Date => helsinkiWallTimeToInstant(dateKey, minutes);

describe('pointerToMinutes', () => {
  test('snaps to 15 minutes from the top of the grid', () => {
    expect(pointerToMinutes(0, RANGE, 60)).toBe(480);
    expect(pointerToMinutes(67, RANGE, 60)).toBe(540);
    expect(pointerToMinutes(70, RANGE, 60)).toBe(555);
    expect(pointerToMinutes(120, RANGE, 120)).toBe(540);
  });

  test('clamps above and below the visible hours', () => {
    expect(pointerToMinutes(-20, RANGE, 60)).toBe(480);
    expect(pointerToMinutes(900, RANGE, 60)).toBe(1080);
  });
});

describe('dragTimes', () => {
  test('orders an upward drag', () => {
    expect(dragTimes(660, 600)).toEqual({ startMinutes: 600, endMinutes: 660 });
  });

  test('a click without movement makes nothing', () => {
    expect(dragTimes(600, 600)).toBeNull();
  });

  test('one slot of movement is enough', () => {
    expect(dragTimes(600, 615)).toEqual({ startMinutes: 600, endMinutes: 615 });
  });
});

describe('doubleClickTimes', () => {
  test('makes a one-hour note at the slot', () => {
    expect(doubleClickTimes(600, RANGE)).toEqual({ startMinutes: 600, endMinutes: 660 });
  });

  test('keeps the hour inside the grid near the bottom', () => {
    expect(doubleClickTimes(1075, RANGE)).toEqual({ startMinutes: 1020, endMinutes: 1080 });
  });
});

describe('nextFreeSlot', () => {
  test('starts at the next whole hour after now and skips classes', () => {
    const busy = [buildSession('lecture', DAY, 8, 10)];
    expect(nextFreeSlot(busy, DAY, at(DAY, 7 * 60 + 30))).toEqual({
      dateKey: DAY,
      startMinutes: 600,
      endMinutes: 660,
    });
    expect(nextFreeSlot([], DAY, at(DAY, 13 * 60 + 20)).startMinutes).toBe(14 * 60);
  });

  test('notes count as busy and a full day moves to the next one', () => {
    const busy = [buildSession('long', DAY, 8, 16), buildNote('n', DAY, 16, 18)];
    expect(nextFreeSlot(busy, DAY, null)).toEqual({ dateKey: '2026-10-28', startMinutes: 480, endMinutes: 540 });
  });

  test('falls back to 10.00 on the first searched day when a week is full', () => {
    const keys = ['2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02'];
    const busy = keys.map((dateKey) => buildSession(`busy-${dateKey}`, dateKey, 8, 18));
    expect(nextFreeSlot(busy, DAY, null)).toEqual({ dateKey: DAY, startMinutes: 600, endMinutes: 660 });
  });
});

describe('slotInView', () => {
  test('searches from now when today is in view, else from the first day in view', () => {
    const view = { startKey: '2026-10-26', endKey: '2026-11-02' };
    expect(slotInView([], view, DAY, at(DAY, 9 * 60 + 5)).startMinutes).toBe(600);
    const nextWeek = { startKey: '2026-11-02', endKey: '2026-11-09' };
    expect(slotInView([], nextWeek, DAY, at(DAY, 9 * 60 + 5))).toEqual({
      dateKey: '2026-11-02',
      startMinutes: 480,
      endMinutes: 540,
    });
  });
});

describe('slotBlock', () => {
  test('turns a slot into a timed block in Finnish time', () => {
    const block = slotBlock({ dateKey: DAY, startMinutes: 600, endMinutes: 690 });
    expect(block.id).toBe('note-draft');
    expect(helsinkiMinutesOfDay(block.start)).toBe(600);
    expect(helsinkiMinutesOfDay(block.end)).toBe(690);
  });
});
