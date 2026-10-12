/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { buildDeadline } from '@/app/api/dataPoints/calendar/__fixtures__/buildDeadline';
import { buildNote } from '@/app/schedule/__fixtures__/buildNote';
import { buildSession } from '@/app/schedule/__fixtures__/buildSession';
import { weekendHasContent } from './weekend';

const WEEKEND = ['2026-10-10', '2026-10-11'];

describe('weekendHasContent', () => {
  test('an empty weekend can collapse', () => {
    expect(weekendHasContent(WEEKEND, [buildSession('fri', '2026-10-09', 10, 12)], {})).toBe(false);
  });

  test('a Sunday deadline keeps the weekend open', () => {
    const allDay = { '2026-10-11': [{ kind: 'deadline' as const, deadline: buildDeadline('a2', '2026-10-11', 0) }] };
    expect(weekendHasContent(WEEKEND, [], allDay)).toBe(true);
  });

  test('a class or note on Saturday keeps the weekend open', () => {
    expect(weekendHasContent(WEEKEND, [buildSession('sat', '2026-10-10', 10, 12)], {})).toBe(true);
    expect(weekendHasContent(WEEKEND, [buildNote('n', '2026-10-10', 10, 11)], {})).toBe(true);
  });
});
