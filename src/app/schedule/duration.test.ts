/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { parseIsoDurationMs } from './duration';

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
