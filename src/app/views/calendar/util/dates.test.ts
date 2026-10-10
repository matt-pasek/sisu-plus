/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { findPeriodName, monthGrid, weekDateKeys } from './dates';

describe('weekDateKeys', () => {
  test('returns Monday to Sunday around the anchor', () => {
    expect(weekDateKeys('2026-10-28')).toEqual([
      '2026-10-26',
      '2026-10-27',
      '2026-10-28',
      '2026-10-29',
      '2026-10-30',
      '2026-10-31',
      '2026-11-01',
    ]);
  });
});

describe('monthGrid', () => {
  test('covers the month with whole weeks', () => {
    const weeks = monthGrid('2026-10-01');
    expect(weeks).toHaveLength(5);
    expect(weeks[0][0]).toBe('2026-09-28');
    expect(weeks[4][0]).toBe('2026-10-26');
  });

  test('a month starting on Monday with 28 days has four weeks', () => {
    expect(monthGrid('2027-02-01')).toHaveLength(4);
  });
});

describe('findPeriodName', () => {
  const periods = [
    { name: '1. period', startDate: '2026-08-31', endDate: '2026-10-26' },
    { name: '2. period', startDate: '2026-10-26', endDate: '2027-01-01' },
  ];

  test('treats the end date as exclusive', () => {
    expect(findPeriodName('2026-10-25', periods)).toBe('1. period');
    expect(findPeriodName('2026-10-26', periods)).toBe('2. period');
  });

  test('returns null outside every period', () => {
    expect(findPeriodName('2026-08-10', periods)).toBeNull();
  });
});
