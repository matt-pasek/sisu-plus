/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { academicYearRangeFor, termRangeFor } from './terms';

describe('termRangeFor', () => {
  test('splits the year into autumn and spring', () => {
    expect(termRangeFor('2026-10-12')).toEqual({ startKey: '2026-08-01', endKey: '2027-01-01' });
    expect(termRangeFor('2027-03-01')).toEqual({ startKey: '2027-01-01', endKey: '2027-08-01' });
  });
});

describe('academicYearRangeFor', () => {
  test('runs from August to the next August', () => {
    expect(academicYearRangeFor('2026-10-12')).toEqual({ startKey: '2026-08-01', endKey: '2027-08-01' });
    expect(academicYearRangeFor('2027-03-01')).toEqual({ startKey: '2026-08-01', endKey: '2027-08-01' });
    expect(academicYearRangeFor('2026-08-01')).toEqual({ startKey: '2026-08-01', endKey: '2027-08-01' });
    expect(academicYearRangeFor('2026-07-31')).toEqual({ startKey: '2025-08-01', endKey: '2026-08-01' });
  });
});
