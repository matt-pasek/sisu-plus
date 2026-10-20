/// <reference types="bun-types" />
import { describe, expect, test } from 'bun:test';
import { formatPeriodNameRange } from './periodNameRange';

describe('formatPeriodNameRange', () => {
  test('joins a shared suffix with an en dash', () => {
    expect(formatPeriodNameRange('3. period', '4. period')).toBe('3.–4. period');
  });

  test('falls back to spaced names without a shared suffix', () => {
    expect(formatPeriodNameRange('Summer', '1. period')).toBe('Summer – 1. period');
  });

  test('returns a single name unchanged', () => {
    expect(formatPeriodNameRange('3. period', '3. period')).toBe('3. period');
  });
});
