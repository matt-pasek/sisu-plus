/// <reference types="bun-types" />
import { describe, expect, test } from 'bun:test';
import { getNextTeachingWindow } from './nextTeaching';

describe('getNextTeachingWindow', () => {
  const past = { startDate: '2026-01-10', endDate: '2026-03-01' };
  const running = { startDate: '2026-09-01', endDate: '2026-11-01' };
  const next = { startDate: '2027-01-13', endDate: '2027-03-03' };

  test('picks the earliest teaching that has not ended yet', () => {
    expect(getNextTeachingWindow([next, past, running], '2026-10-21')).toEqual(running);
  });

  test('skips teaching that is already over', () => {
    expect(getNextTeachingWindow([past, next], '2026-10-21')).toEqual(next);
  });

  test('is null when nothing is dated or everything is over', () => {
    expect(getNextTeachingWindow([{ startDate: null, endDate: null }, past], '2026-10-21')).toBeNull();
    expect(getNextTeachingWindow([], '2026-10-21')).toBeNull();
  });
});
