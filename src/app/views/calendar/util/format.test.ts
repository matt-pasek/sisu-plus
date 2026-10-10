/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { formatClock, formatMonthTitle, formatSessionDate, formatWeekRange, joinNames } from './format';

describe('format', () => {
  test('formats clock times in Helsinki with a dot', () => {
    expect(formatClock(new Date('2026-10-27T12:00:00.000Z'))).toBe('14.00');
    expect(formatClock(new Date('2026-10-20T06:05:00.000Z'))).toBe('09.05');
  });

  test('formats a session date', () => {
    expect(formatSessionDate('2026-10-27', 'en')).toBe('Tue 27.10');
    expect(formatSessionDate('2026-10-27', 'fi').endsWith(' 27.10')).toBe(true);
  });

  test('formats a week range', () => {
    expect(formatWeekRange('2026-10-26', '2026-11-01', 'en')).toBe('26 Oct – 1 Nov');
  });

  test('formats a capitalised month title', () => {
    expect(formatMonthTitle('2026-10-01', 'en')).toBe('October 2026');
    expect(formatMonthTitle('2026-10-01', 'fi').charAt(0)).toBe('L');
  });

  test('joins names as a list', () => {
    expect(joinNames(['Basic Chinese 1 lecture', 'Advanced Networks lab'], 'en')).toBe(
      'Basic Chinese 1 lecture and Advanced Networks lab',
    );
  });
});
