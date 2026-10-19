/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { minutesToTimeValue, parseRepeat, timeValueToMinutes } from './noteForm';

describe('note form values', () => {
  test('converts minutes to and from time inputs', () => {
    expect(minutesToTimeValue(9 * 60 + 5)).toBe('09:05');
    expect(timeValueToMinutes('14:30')).toBe(870);
    expect(timeValueToMinutes('')).toBeNull();
    expect(timeValueToMinutes('25:00')).toBeNull();
  });

  test('reads only known repeat values', () => {
    expect(parseRepeat('WEEKLY')).toBe('WEEKLY');
    expect(parseRepeat('YEARLY')).toBe('NEVER');
  });
});
