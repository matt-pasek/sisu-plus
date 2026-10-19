/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { formatAcademicYear, formatDayTitle, formatHours, formatMonthShort } from './format';

describe('view formatting', () => {
  test('formats a day title in English and Finnish', () => {
    expect(formatDayTitle('2026-10-27', 'en')).toBe('Tuesday 27 October');
    expect(formatDayTitle('2026-10-27', 'fi')).toBe('Tiistai 27. lokakuuta');
  });

  test('formats the academic year', () => {
    expect(formatAcademicYear({ startKey: '2026-08-01', endKey: '2027-08-01' })).toBe('2026–27');
  });

  test('rounds hours to the nearest half hour with a locale decimal mark', () => {
    expect(formatHours(120, 'en')).toBe('2');
    expect(formatHours(90, 'en')).toBe('1.5');
    expect(formatHours(90, 'fi')).toBe('1,5');
    expect(formatHours(100, 'en')).toBe('1.5');
  });

  test('formats a short month label', () => {
    expect(formatMonthShort('2026-10-01', 'en')).toBe('Oct');
  });
});
