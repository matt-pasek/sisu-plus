/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { buildSession } from '@/app/schedule/__fixtures__/buildSession';
import { previewSummary } from './timetable';

describe('previewSummary', () => {
  test('counts active sessions and names the first and last day and the pattern', () => {
    const sessions = [
      buildSession('a', '2026-10-05', 12, 14),
      buildSession('b', '2026-10-12', 12, 14),
      buildSession('c', '2026-12-03', 12, 14),
      buildSession('x', '2026-10-07', 12, 14, { cancelled: true }),
    ];
    expect(previewSummary(sessions, 'en')).toEqual({
      count: 3,
      first: '5.10.',
      last: '3.12.',
      pattern: 'Mon 12.00–14.00',
    });
  });

  test('is empty without sessions', () => {
    expect(previewSummary([], 'en')).toEqual({ count: 0, first: null, last: null, pattern: null });
  });
});
