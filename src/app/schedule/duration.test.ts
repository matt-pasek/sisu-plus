/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { formatIsoDuration, parseIsoDurationMs, tryParseIsoDurationMs } from './duration';

describe('parseIsoDurationMs', () => {
  test('parses hours, minutes, seconds and days', () => {
    expect(parseIsoDurationMs('PT2H')).toBe(7_200_000);
    expect(parseIsoDurationMs('PT1H30M')).toBe(5_400_000);
    expect(parseIsoDurationMs('P1DT2H')).toBe(93_600_000);
    expect(parseIsoDurationMs('PT60S')).toBe(60_000);
  });

  test('falls back to one hour for unreadable input', () => {
    expect(parseIsoDurationMs('soon')).toBe(3_600_000);
  });
});

describe('tryParseIsoDurationMs', () => {
  test('parses the shapes Sisu writes', () => {
    expect(tryParseIsoDurationMs('PT1H')).toBe(3_600_000);
    expect(tryParseIsoDurationMs('PT1H30M')).toBe(5_400_000);
    expect(tryParseIsoDurationMs('PT90M')).toBe(5_400_000);
    expect(tryParseIsoDurationMs('P1DT2H')).toBe(26 * 3_600_000);
  });

  test('returns null instead of guessing for unreadable or empty durations', () => {
    expect(tryParseIsoDurationMs('soon')).toBeNull();
    expect(tryParseIsoDurationMs('PT0S')).toBeNull();
    expect(tryParseIsoDurationMs('P')).toBeNull();
  });
});

describe('formatIsoDuration', () => {
  test('writes hours and minutes', () => {
    expect(formatIsoDuration(90)).toBe('PT1H30M');
    expect(formatIsoDuration(60)).toBe('PT1H');
    expect(formatIsoDuration(45)).toBe('PT45M');
  });
});
