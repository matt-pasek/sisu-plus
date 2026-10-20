/// <reference types="bun-types" />
import { describe, expect, test } from 'bun:test';
import { getTerm } from './getTerm';

describe('getTerm', () => {
  test('a period starting in August or later belongs to the autumn of its study year', () => {
    expect(getTerm({ startDate: '2026-08-31', studyYear: 2026 })).toEqual({ season: 'autumn', year: 2026 });
    expect(getTerm({ startDate: '2026-10-26', studyYear: 2026 })).toEqual({ season: 'autumn', year: 2026 });
  });

  test('a period starting before August belongs to the spring of the next calendar year', () => {
    expect(getTerm({ startDate: '2027-03-08', studyYear: 2026 })).toEqual({ season: 'spring', year: 2027 });
  });

  test('reads the month from the date key, so a January 1st start stays spring in any timezone', () => {
    expect(getTerm({ startDate: '2027-01-01', studyYear: 2026 })).toEqual({ season: 'spring', year: 2027 });
    expect(getTerm({ startDate: '2026-08-01', studyYear: 2026 })).toEqual({ season: 'autumn', year: 2026 });
  });
});
