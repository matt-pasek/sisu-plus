/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { buildSession } from './__fixtures__/buildSession';
import { noTeachingWeeks } from './teachingWeeks';

const RANGE = { startKey: '2026-08-01', endKey: '2027-01-01' };
const PERIOD_1 = { startDate: '2026-08-31', endDate: '2026-10-26' };

describe('noTeachingWeeks', () => {
  test('flags a week inside a taught period that has no teaching', () => {
    const sessions = [buildSession('a', '2026-09-01', 10, 12), buildSession('b', '2026-10-13', 10, 12)];
    const weeks = noTeachingWeeks(sessions, [PERIOD_1], RANGE);
    expect(weeks.has('2026-10-19')).toBe(true);
    expect(weeks.has('2026-10-12')).toBe(false);
    expect(weeks.has('2026-08-31')).toBe(false);
  });

  test('a period with no teaching at all is not flagged', () => {
    expect(noTeachingWeeks([], [PERIOD_1], RANGE).size).toBe(0);
  });

  test('exams and cancelled sessions are not teaching', () => {
    const sessions = [
      buildSession('a', '2026-09-01', 10, 12),
      buildSession('exam', '2026-10-21', 9, 12, { kind: 'exam' }),
      buildSession('gone', '2026-10-20', 10, 12, { cancelled: true }),
    ];
    expect(noTeachingWeeks(sessions, [PERIOD_1], RANGE).has('2026-10-19')).toBe(true);
  });

  test('weeks only partly inside the period or the loaded range are not flagged', () => {
    const lateStart = { startDate: '2026-09-03', endDate: '2026-10-26' };
    const weeks = noTeachingWeeks([buildSession('a', '2026-09-08', 10, 12)], [lateStart], RANGE);
    expect(weeks.has('2026-08-31')).toBe(false);
    const outside = noTeachingWeeks(
      [buildSession('a', '2026-12-01', 10, 12)],
      [{ startDate: '2026-11-30', endDate: '2027-02-01' }],
      RANGE,
    );
    expect(outside.has('2027-01-04')).toBe(false);
  });
});
