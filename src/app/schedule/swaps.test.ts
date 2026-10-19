/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { buildSession } from './__fixtures__/buildSession';
import { findClashes } from './clashes';
import { nearestSwapTo, otherTimes, suggestSwap, weekSwaps } from './swaps';
import type { GroupRef, Session } from './types';

const COURSE = 'cur-hdd';
const MON = '2026-10-05';
const THU = '2026-10-08';
const NEXT_MON = '2026-10-12';

const groups = new Map<string, GroupRef>([
  ['t1', { id: 't1', courseKey: COURSE, setId: 'ex', visible: true }],
  ['t2', { id: 't2', courseKey: COURSE, setId: 'ex', visible: true }],
]);

const tutorial = (id: string, dateKey: string, from: number, to: number, groupId: string): Session =>
  buildSession(id, dateKey, from, to, { courseKey: COURSE, groupId, groupIds: [groupId], kind: 'exercise' });

const t1Mon = tutorial('t1-mon', MON, 14, 16, 't1');
const t2Mon = tutorial('t2-mon', MON, 16, 18, 't2');
const t1Thu = tutorial('t1-thu', THU, 14, 16, 't1');
const t2Thu = tutorial('t2-thu', THU, 8, 10, 't2');
const t1Next = tutorial('t1-next', NEXT_MON, 14, 16, 't1');
const lab = buildSession('lab-mon', MON, 16, 17, { courseKey: 'cur-net', kind: 'lab' });
const labThu = buildSession('lab-thu', THU, 14, 15, { courseKey: 'cur-net', kind: 'lab' });

const ids = (sessions: Session[]): string[] => sessions.map((session) => session.id);

describe('otherTimes', () => {
  test('lists the other group slots of the same set in the same week', () => {
    expect(ids(otherTimes(t2Mon, [t1Mon, t1Thu, t1Next, t2Thu], groups, new Set()))).toEqual(['t1-mon', 't1-thu']);
  });

  test('leaves out cancelled and already attended slots', () => {
    const cancelled = { ...t1Thu, cancelled: true };
    expect(ids(otherTimes(t2Mon, [t1Mon, cancelled], groups, new Set(['t1-mon'])))).toEqual([]);
  });

  test('is empty for a session without a group', () => {
    expect(otherTimes(lab, [t1Mon], groups, new Set())).toEqual([]);
  });
});

describe('nearestSwapTo', () => {
  test('swaps from the attended session of the set nearest to the target', () => {
    expect(nearestSwapTo(t1Thu, [t2Mon, t2Thu, lab], groups)).toEqual({
      fromSessionId: 't2-thu',
      toSessionId: 't1-thu',
    });
  });

  test('returns null when nothing of the set is attended that week', () => {
    expect(nearestSwapTo(t1Next, [t2Mon, t2Thu], groups)).toBeNull();
  });
});

describe('weekSwaps', () => {
  test('pairs the attended sessions of the week with the target group in start order', () => {
    expect(weekSwaps(t1Thu, [t2Mon, t2Thu], [t1Mon, t1Thu, t1Next], groups)).toEqual([
      { fromSessionId: 't2-mon', toSessionId: 't1-mon' },
      { fromSessionId: 't2-thu', toSessionId: 't1-thu' },
    ]);
  });
});

describe('suggestSwap', () => {
  const [clash] = findClashes([t2Mon, lab]);

  test('suggests the nearest free slot of the other group', () => {
    expect(suggestSwap(clash, [t2Mon, lab, labThu, t2Thu], [t1Thu, t1Mon], groups)).toEqual({
      fromSessionId: 't2-mon',
      toSessionId: 't1-mon',
    });
  });

  test('returns null when every other slot clashes too', () => {
    expect(suggestSwap(clash, [t2Mon, lab, labThu], [t1Thu], groups)).toBeNull();
  });

  test('never moves an exam', () => {
    const exam = tutorial('exam-mon', MON, 16, 18, 't2');
    const [examClash] = findClashes([{ ...exam, kind: 'exam' }, lab]);
    expect(suggestSwap(examClash, [{ ...exam, kind: 'exam' }, lab], [t1Mon], groups)).toBeNull();
  });
});
