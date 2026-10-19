/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { buildDeadline } from '@/app/api/dataPoints/calendar/__fixtures__/buildDeadline';
import { buildNote } from '@/app/schedule/__fixtures__/buildNote';
import { buildSession } from '@/app/schedule/__fixtures__/buildSession';
import { weekendDeadlines, weekendHasContent } from './weekend';

const WEEKEND = ['2026-10-10', '2026-10-11'];

describe('weekendHasContent', () => {
  test('an empty weekend can collapse', () => {
    expect(weekendHasContent(WEEKEND, [buildSession('fri', '2026-10-09', 10, 12)])).toBe(false);
  });

  test('a class or note on Saturday keeps the weekend open', () => {
    expect(weekendHasContent(WEEKEND, [buildSession('sat', '2026-10-10', 10, 12)])).toBe(true);
    expect(weekendHasContent(WEEKEND, [buildNote('n', '2026-10-10', 10, 11)])).toBe(true);
  });
});

describe('weekendDeadlines', () => {
  test('counts weekend deadlines and points at the first day that has one', () => {
    const allDay = {
      '2026-10-11': [
        { kind: 'deadline' as const, deadline: buildDeadline('a2', '2026-10-11', 0) },
        { kind: 'deadline' as const, deadline: buildDeadline('a3', '2026-10-11', 0) },
      ],
    };
    expect(weekendDeadlines(WEEKEND, allDay)).toEqual({ count: 2, firstDateKey: '2026-10-11' });
  });

  test('a weekend holiday on its own is not counted', () => {
    const allDay = {
      '2026-10-10': [{ kind: 'periodStart' as const, name: '2. period' }],
    };
    expect(weekendDeadlines(WEEKEND, allDay)).toEqual({ count: 0, firstDateKey: null });
  });
});
