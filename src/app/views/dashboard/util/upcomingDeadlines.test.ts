/// <reference types="bun-types" />
import { describe, expect, test } from 'bun:test';
import type { IcsEvent } from 'ts-ics';
import { getUpcomingDeadlines, getVisibleDeadlines, isPastDue } from './upcomingDeadlines';

const event = (uid: string, due: string | null): IcsEvent =>
  ({
    uid,
    summary: uid,
    stamp: { date: new Date('2026-10-01T00:00:00Z') },
    start: { date: new Date(due ?? '2026-10-01T00:00:00Z') },
    ...(due ? { end: { date: new Date(due) } } : {}),
  }) as IcsEvent;

const now = new Date('2026-10-27T10:00:00Z');
const events = [
  event('two-weeks-ago', '2026-10-13T20:59:00Z'),
  event('later', '2026-11-04T14:00:00Z'),
  event('last-week', '2026-10-22T20:59:00Z'),
  event('this-morning', '2026-10-27T08:00:00Z'),
  event('tonight', '2026-10-27T20:59:00Z'),
];

describe('getVisibleDeadlines', () => {
  test('keeps the past week of deadlines and everything ahead, soonest first', () => {
    expect(getVisibleDeadlines(events, now).map((item) => item.uid)).toEqual([
      'last-week',
      'this-morning',
      'tonight',
      'later',
    ]);
  });

  test('falls back to the start time when an event has no end', () => {
    const startOnly = { ...event('start-only', null), start: { date: new Date('2026-11-01T10:00:00Z') } } as IcsEvent;
    expect(getVisibleDeadlines([startOnly], now).map((item) => item.uid)).toEqual(['start-only']);
  });
});

describe('isPastDue and getUpcomingDeadlines', () => {
  test('a deadline earlier today is past due, tonight is not', () => {
    expect(isPastDue(event('this-morning', '2026-10-27T08:00:00Z'), now)).toBe(true);
    expect(isPastDue(event('tonight', '2026-10-27T20:59:00Z'), now)).toBe(false);
  });

  test('upcoming leaves out everything already past due', () => {
    expect(getUpcomingDeadlines(events, now).map((item) => item.uid)).toEqual(['tonight', 'later']);
  });
});
