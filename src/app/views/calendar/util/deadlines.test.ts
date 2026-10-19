/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { buildDeadline } from '@/app/api/dataPoints/calendar/__fixtures__/buildDeadline';
import { helsinkiWallTimeToInstant } from '@/app/schedule';
import { deadlineColor, dueRelative, dueSoon, NEUTRAL_DEADLINE_COLOR } from './deadlines';

const now = helsinkiWallTimeToInstant('2026-10-27', 12 * 60);

describe('dueSoon', () => {
  test('keeps the next 7 days from now, at most 5, past ones out', () => {
    const deadlines = [
      buildDeadline('past', '2026-10-27', 9),
      ...['2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01'].map((dateKey) =>
        buildDeadline(dateKey, dateKey, 23.98),
      ),
      buildDeadline('far', '2026-11-04', 12.5),
    ];
    expect(dueSoon(deadlines, now).map((deadline) => deadline.id)).toEqual([
      '2026-10-27',
      '2026-10-28',
      '2026-10-29',
      '2026-10-30',
      '2026-10-31',
    ]);
  });
});

describe('dueRelative', () => {
  test('says today, tomorrow or in n days', () => {
    expect(dueRelative('2026-10-27', '2026-10-27')).toEqual({ kind: 'today' });
    expect(dueRelative('2026-10-28', '2026-10-27')).toEqual({ kind: 'tomorrow' });
    expect(dueRelative('2026-10-30', '2026-10-27')).toEqual({ kind: 'days', count: 3 });
  });
});

describe('deadlineColor', () => {
  test('uses the course colour or a neutral grey', () => {
    expect(deadlineColor(buildDeadline('a', '2026-10-27', 12))).toBe(NEUTRAL_DEADLINE_COLOR);
    expect(deadlineColor(buildDeadline('b', '2026-10-27', 12, { colorIndex: 0 }))).not.toBe(NEUTRAL_DEADLINE_COLOR);
  });
});
