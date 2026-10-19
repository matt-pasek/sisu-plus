/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { termRangeFor } from './terms';
import {
  addDaysToDateKey,
  addMonthsToDateKey,
  daysBetween,
  helsinkiDateKey,
  helsinkiMinutesOfDay,
  helsinkiWallTimeToInstant,
  isoWeekNumber,
  parseSisuDateTime,
  startOfWeekKey,
  weekdayIndex,
} from './time';

describe('helsinkiWallTimeToInstant', () => {
  test('uses summer time before the October change', () => {
    expect(helsinkiWallTimeToInstant('2026-10-24', 14 * 60).toISOString()).toBe('2026-10-24T11:00:00.000Z');
  });

  test('uses winter time after the October change', () => {
    expect(helsinkiWallTimeToInstant('2026-10-26', 14 * 60).toISOString()).toBe('2026-10-26T12:00:00.000Z');
  });

  test('uses summer time after the March change', () => {
    expect(helsinkiWallTimeToInstant('2027-03-29', 10 * 60).toISOString()).toBe('2027-03-29T07:00:00.000Z');
  });

  test('rolls 24.00 over to the next day', () => {
    expect(helsinkiWallTimeToInstant('2026-11-02', 24 * 60).toISOString()).toBe('2026-11-02T22:00:00.000Z');
  });
});

describe('parseSisuDateTime', () => {
  test('reads offset-less Sisu date-times as Helsinki wall time', () => {
    expect(parseSisuDateTime('2026-10-20T14:00:00').toISOString()).toBe('2026-10-20T11:00:00.000Z');
    expect(parseSisuDateTime('2026-10-28T14:00:00').toISOString()).toBe('2026-10-28T12:00:00.000Z');
    expect(parseSisuDateTime('2026-10-28T14:00').toISOString()).toBe('2026-10-28T12:00:00.000Z');
    expect(parseSisuDateTime('2026-10-28T14:00:30.500').toISOString()).toBe('2026-10-28T12:00:30.500Z');
  });

  test('keeps values that carry a zone', () => {
    expect(parseSisuDateTime('2026-10-20T11:00:00.000Z').toISOString()).toBe('2026-10-20T11:00:00.000Z');
    expect(parseSisuDateTime('2026-10-20T14:00:00+03:00').toISOString()).toBe('2026-10-20T11:00:00.000Z');
  });
});

describe('helsinki readers', () => {
  test('reads the Helsinki calendar date, not the UTC one', () => {
    expect(helsinkiDateKey(new Date('2026-10-26T22:30:00.000Z'))).toBe('2026-10-27');
  });

  test('reads minutes of day in Helsinki', () => {
    expect(helsinkiMinutesOfDay(new Date('2026-10-27T12:00:00.000Z'))).toBe(14 * 60);
  });
});

describe('date key arithmetic', () => {
  test('adds days across month ends', () => {
    expect(addDaysToDateKey('2026-10-30', 3)).toBe('2026-11-02');
  });

  test('adds months clamped to the month end', () => {
    expect(addMonthsToDateKey('2027-01-31', 1)).toBe('2027-02-28');
    expect(addMonthsToDateKey('2027-01-31', 2)).toBe('2027-03-31');
  });

  test('counts days between keys', () => {
    expect(daysBetween('2026-10-26', '2026-11-02')).toBe(7);
  });

  test('indexes weekdays from Monday', () => {
    expect(weekdayIndex('2026-10-26')).toBe(0);
    expect(weekdayIndex('2026-11-01')).toBe(6);
  });

  test('finds the Monday of a week', () => {
    expect(startOfWeekKey('2026-10-28')).toBe('2026-10-26');
    expect(startOfWeekKey('2026-11-01')).toBe('2026-10-26');
  });

  test('computes ISO week numbers', () => {
    expect(isoWeekNumber('2026-10-05')).toBe(41);
    expect(isoWeekNumber('2026-10-26')).toBe(44);
    expect(isoWeekNumber('2027-01-01')).toBe(53);
    expect(isoWeekNumber('2027-01-04')).toBe(1);
  });
});

describe('termRangeFor', () => {
  test('autumn runs from August to the new year', () => {
    expect(termRangeFor('2026-10-10')).toEqual({ startKey: '2026-08-01', endKey: '2027-01-01' });
    expect(termRangeFor('2026-08-01')).toEqual({ startKey: '2026-08-01', endKey: '2027-01-01' });
  });

  test('spring runs from the new year to August', () => {
    expect(termRangeFor('2027-03-01')).toEqual({ startKey: '2027-01-01', endKey: '2027-08-01' });
  });
});
