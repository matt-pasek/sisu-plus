/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { buildDeadline } from '@/app/api/dataPoints/calendar/__fixtures__/buildDeadline';
import { allDayByDay, allDayItems, allDayLimit, splitAllDay } from './allDay';

const DAY = '2026-11-02';
const input = {
  holidays: [{ dateKey: DAY, id: 'allSaints' as const }],
  periods: [{ name: 'Period 2', startDate: DAY }],
  deadlines: [buildDeadline('late', DAY, 23.98), buildDeadline('noon', DAY, 12)],
};

describe('allDayItems', () => {
  test('orders holiday, period start, then deadlines by due time', () => {
    expect(allDayItems(DAY, input).map((item) => item.kind)).toEqual([
      'holiday',
      'periodStart',
      'deadline',
      'deadline',
    ]);
    const deadlines = allDayItems(DAY, input).filter((item) => item.kind === 'deadline');
    expect(deadlines.map((item) => (item.kind === 'deadline' ? item.deadline.id : ''))).toEqual(['noon', 'late']);
  });

  test('other days are empty', () => {
    expect(allDayByDay(['2026-11-03'], input)['2026-11-03']).toEqual([]);
  });
});

describe('splitAllDay', () => {
  test('shows three and counts the rest', () => {
    const { shown, hidden } = splitAllDay(allDayItems(DAY, input));
    expect(shown).toHaveLength(3);
    expect(hidden).toBe(1);
  });
});

describe('allDayLimit', () => {
  test('a single day shows every item, since +N there would open the same day', () => {
    expect(allDayLimit(1)).toBe(Infinity);
    expect(splitAllDay(allDayItems(DAY, input), allDayLimit(1)).hidden).toBe(0);
  });

  test('a week keeps three per day', () => {
    expect(allDayLimit(7)).toBe(3);
  });
});
