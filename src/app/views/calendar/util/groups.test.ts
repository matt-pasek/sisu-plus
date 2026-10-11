/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import type { CalendarGroup } from '@/app/api/dataPoints/calendar/types';
import { buildSession } from '@/app/schedule/__fixtures__/buildSession';
import type { GroupRef, GroupStats } from '@/app/schedule';
import { previewModel, sessionsByGroup, sortGroups, weeklyPattern } from './groups';

const COURSE = 'cur-hdd';
const t1 = (id: string, day: string, from: number, to: number) =>
  buildSession(id, day, from, to, { courseKey: COURSE, groupId: 't1', groupIds: ['t1'] });
const t2 = (id: string, day: string, from: number, to: number) =>
  buildSession(id, day, from, to, { courseKey: COURSE, groupId: 't2', groupIds: ['t2'] });

describe('weeklyPattern', () => {
  test('names the repeating slot', () => {
    const sessions = ['2026-10-07', '2026-10-14', '2026-10-21'].map((day, index) => t1(`w${index}`, day, 10, 12));
    expect(weeklyPattern(sessions, 'en')).toBe('Wed 10.00–12.00');
  });

  test('lists up to three repeating slots in weekday order', () => {
    const sessions = [
      t2('a', '2026-10-08', 8, 10),
      t2('b', '2026-10-15', 8, 10),
      t2('c', '2026-10-05', 16, 18),
      t2('d', '2026-10-12', 16, 18),
      t2('e', '2026-10-06', 17, 19),
      t2('f', '2026-10-13', 17, 19),
    ];
    expect(weeklyPattern(sessions, 'en')).toBe('Mon 16.00–18.00, Tue 17.00–19.00, Thu 08.00–10.00');
  });

  test('falls back to the first slot when nothing repeats, and is null without sessions', () => {
    expect(weeklyPattern([t1('x', '2026-10-06', 9, 10), t1('y', '2026-10-09', 12, 13)], 'en')).toBe('Tue 09.00–10.00');
    expect(weeklyPattern([], 'en')).toBeNull();
  });
});

describe('sessionsByGroup', () => {
  test('groups one course by group, unique and in start order', () => {
    const late = t1('late', '2026-10-08', 14, 16);
    const early = t1('early', '2026-10-05', 14, 16);
    const other = buildSession('o', '2026-10-05', 9, 10, { courseKey: 'cur-x', groupId: 't1' });
    const byGroup = sessionsByGroup([late, early, late, t2('b', '2026-10-06', 9, 10), other], COURSE);
    expect(byGroup.get('t1')?.map((session) => session.id)).toEqual(['early', 'late']);
    expect(byGroup.get('t2')?.map((session) => session.id)).toEqual(['b']);
  });
});

describe('sortGroups', () => {
  const group = (id: string): CalendarGroup => ({
    id,
    name: id,
    setId: 'ex',
    eventIds: ['e'],
    isInCalendar: true,
    hasEntry: true,
    cancelled: false,
  });
  const stats = (clashing: number): GroupStats => ({ total: 3, clashing, perSession: [], clashCourseNames: [] });

  test('orders by fewest clashes, then earliest first session', () => {
    const sessions = new Map([
      ['a', [t1('a1', '2026-10-06', 9, 10)]],
      ['b', [t1('b1', '2026-10-05', 9, 10)]],
      ['c', [t1('c1', '2026-10-05', 8, 9)]],
    ]);
    const statsByGroup = new Map([
      ['a', stats(0)],
      ['b', stats(0)],
      ['c', stats(2)],
    ]);
    expect(sortGroups([group('c'), group('a'), group('b')], statsByGroup, sessions).map((g) => g.id)).toEqual([
      'b',
      'a',
      'c',
    ]);
  });
});

describe('previewModel', () => {
  const groups = new Map<string, GroupRef>([
    ['t1', { id: 't1', courseKey: COURSE, setId: 'ex', visible: false }],
    ['t2', { id: 't2', courseKey: COURSE, setId: 'ex', visible: true }],
  ]);
  const candidates = [
    t1('t1-mon', '2026-10-05', 14, 16),
    t1('t1-thu', '2026-10-08', 14, 16),
    t1('t1-next', '2026-10-12', 14, 16),
  ];
  const attended = [
    t2('t2-mon', '2026-10-05', 15, 17),
    buildSession('lab-thu', '2026-10-08', 14, 15, { courseKey: 'cur-net' }),
  ];

  test('previews the week of one group and flags clashes outside its set', () => {
    const preview = previewModel(candidates, attended, groups, 't1', '2026-10-05', '2026-10-12');
    expect(preview.sessions.map((session) => session.id)).toEqual(['t1-mon', 't1-thu']);
    expect([...preview.clashIds]).toEqual(['t1-thu']);
  });

  test('is empty without a group', () => {
    expect(previewModel(candidates, attended, groups, null, '2026-10-05', '2026-10-12').sessions).toEqual([]);
  });
});
