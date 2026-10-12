/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { buildSession } from '@/app/schedule/__fixtures__/buildSession';
import { findClashes } from '@/app/schedule';
import {
  clashesInRange,
  isNewNoteKey,
  parseCalendarView,
  stepAnchor,
  viewChange,
  viewForKey,
  viewTitle,
  visibleRange,
} from './navigation';

describe('parseCalendarView', () => {
  test('accepts known views and falls back to week', () => {
    expect(parseCalendarView('month')).toBe('month');
    expect(parseCalendarView('agenda')).toBe('week');
    expect(parseCalendarView(undefined)).toBe('week');
    expect(parseCalendarView(3)).toBe('week');
  });
});

describe('stepAnchor', () => {
  test('moves by one unit of the view', () => {
    expect(stepAnchor('day', '2026-10-27', 1)).toBe('2026-10-28');
    expect(stepAnchor('week', '2026-10-28', -1)).toBe('2026-10-19');
    expect(stepAnchor('month', '2026-01-31', 1)).toBe('2026-02-01');
    expect(stepAnchor('year', '2026-10-27', 1)).toBe('2027-10-27');
  });
});

describe('visibleRange', () => {
  test('covers the day, week, month or academic year shown', () => {
    expect(visibleRange('day', '2026-10-27')).toEqual({ startKey: '2026-10-27', endKey: '2026-10-28' });
    expect(visibleRange('week', '2026-10-28')).toEqual({ startKey: '2026-10-26', endKey: '2026-11-02' });
    expect(visibleRange('month', '2026-12-15')).toEqual({ startKey: '2026-12-01', endKey: '2027-01-01' });
    expect(visibleRange('year', '2027-03-01')).toEqual({ startKey: '2026-08-01', endKey: '2027-08-01' });
  });
});

describe('clashesInRange', () => {
  test('keeps clashes whose sessions fall in the range', () => {
    const inside = [buildSession('a', '2026-10-27', 14, 16), buildSession('b', '2026-10-27', 15, 17)];
    const outside = [buildSession('c', '2026-11-10', 14, 16), buildSession('d', '2026-11-10', 15, 17)];
    const sessions = [...inside, ...outside];
    const byId = new Map(sessions.map((session) => [session.id, session]));
    const clashes = findClashes(sessions);
    expect(clashesInRange(clashes, byId, { startKey: '2026-10-26', endKey: '2026-11-02' })).toHaveLength(1);
  });
});

describe('viewTitle', () => {
  test('names the period shown', () => {
    expect(viewTitle('month', '2026-10-27', 'en')).toBe('October 2026');
    expect(viewTitle('year', '2026-10-27', 'en')).toBe('2026–27');
    expect(viewTitle('day', '2026-10-27', 'en')).toBe('Tuesday 27 October');
  });
});

describe('view switching', () => {
  test('maps D, W, M and Y to views and ignores held keys', () => {
    expect(viewForKey('m', false)).toBe('month');
    expect(viewForKey('Y', false)).toBe('year');
    expect(viewForKey('w', true)).toBeNull();
    expect(viewForKey('x', false)).toBeNull();
  });

  test('switching to the view already shown is no change', () => {
    expect(viewChange('week', 'week')).toBeNull();
    expect(viewChange('week', 'day')).toBe('day');
  });
});

describe('isNewNoteKey', () => {
  test('N makes a note, held keys and other letters do not', () => {
    expect(isNewNoteKey('n', false)).toBe(true);
    expect(isNewNoteKey('N', false)).toBe(true);
    expect(isNewNoteKey('n', true)).toBe(false);
    expect(isNewNoteKey('m', false)).toBe(false);
  });
});
