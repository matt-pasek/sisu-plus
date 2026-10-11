/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { buildSession } from './__fixtures__/buildSession';
import { ALL_DATES, applyAttendance } from './attendance';
import { seriesKeyOf } from './series';
import type { AttendancePlan, GroupRef, Session } from './types';

const COURSE = 'cur-hdd';
const MON = '2026-10-05';
const THU = '2026-10-08';

const ref = (id: string, setId: string, visible = true): GroupRef => ({ id, courseKey: COURSE, setId, visible });
const index = (...refs: GroupRef[]): Map<string, GroupRef> => new Map(refs.map((item) => [item.id, item]));
const ALL_VISIBLE = index(ref('lec', 'teaching'), ref('t1', 'ex'), ref('t2', 'ex'));

const owned = (id: string, dateKey: string, from: number, to: number, groupIds: string[], groupId: string): Session =>
  buildSession(id, dateKey, from, to, { courseKey: COURSE, groupId, groupIds, kind: 'exercise' });

const t1Mon = owned('t1-mon', MON, 14, 16, ['t1'], 't1');
const t2Mon = owned('t2-mon', MON, 16, 18, ['t2'], 't2');
const t1Thu = owned('t1-thu', THU, 14, 16, ['t1'], 't1');
const t2Thu = owned('t2-thu', THU, 8, 10, ['t2'], 't2');
const networks = buildSession('net-mon', MON, 16, 17, { courseKey: 'cur-net', kind: 'lab' });
const SESSIONS = [t1Mon, t2Mon, t1Thu, t2Thu, networks];

const planFor = (overrides: Partial<AttendancePlan>): Record<string, AttendancePlan> => ({
  [COURSE]: { usual: {}, swaps: [], skips: [], dismissed: [], ...overrides },
});

const sortedIds = (sessions: Session[]): string[] => sessions.map((session) => session.id).sort();

describe('applyAttendance', () => {
  test('without a plan every visible session is attended', () => {
    const result = applyAttendance(SESSIONS, ALL_VISIBLE, {});
    expect(sortedIds(result.attended)).toEqual(sortedIds(SESSIONS));
    expect(result.alternatives).toEqual([]);
  });

  test('a usual group turns the other groups of its set into alternatives', () => {
    const result = applyAttendance(SESSIONS, ALL_VISIBLE, planFor({ usual: { ex: 't2' } }));
    expect(sortedIds(result.alternatives)).toEqual(['t1-mon', 't1-thu']);
    expect(result.statusById.get('t2-mon')).toBe('attended');
  });

  test('a usual group that is not switched on is ignored', () => {
    const groups = index(ref('t1', 'ex'), ref('t2', 'ex', false));
    const result = applyAttendance([t1Mon, t1Thu], groups, planFor({ usual: { ex: 't2' } }));
    expect(result.alternatives).toEqual([]);
  });

  test('a swap attends the target and turns the original into an alternative', () => {
    const plans = planFor({ usual: { ex: 't2' }, swaps: [{ fromSessionId: 't2-mon', toSessionId: 't1-mon' }] });
    const result = applyAttendance(SESSIONS, ALL_VISIBLE, plans);
    expect(result.statusById.get('t1-mon')).toBe('attended');
    expect(result.statusById.get('t2-mon')).toBe('alternative');
    expect(result.swappedIn.has('t1-mon')).toBe(true);
    expect(result.statusById.get('t1-thu')).toBe('alternative');
  });

  test('a swap can target a group that is not switched on', () => {
    const t1Wed = owned('t1-wed', '2026-10-07', 10, 12, ['t1'], 't1');
    const groups = index(ref('t1', 'ex', false), ref('t2', 'ex'));
    const plans = planFor({ swaps: [{ fromSessionId: 't2-mon', toSessionId: 't1-wed' }] });
    const result = applyAttendance([t2Mon, t2Thu], groups, plans, [t1Wed]);
    expect(sortedIds(result.attended)).toEqual(['t1-wed', 't2-thu']);
    expect(result.statusById.get('t2-mon')).toBe('alternative');
  });

  test('a swap whose target is missing keeps the original and reports it', () => {
    const plans = planFor({ swaps: [{ fromSessionId: 't2-mon', toSessionId: 'gone@2026-10-06#0' }] });
    const result = applyAttendance(SESSIONS, ALL_VISIBLE, plans);
    expect(result.statusById.get('t2-mon')).toBe('attended');
    expect(result.unavailableSwaps.has('t2-mon')).toBe(true);
  });

  test('a swap whose target is cancelled keeps the original without reporting it', () => {
    const cancelled = owned('t1-wed', '2026-10-07', 10, 12, ['t1'], 't1');
    const plans = planFor({ swaps: [{ fromSessionId: 't2-mon', toSessionId: 't1-wed' }] });
    const result = applyAttendance([t2Mon, { ...cancelled, cancelled: true }], ALL_VISIBLE, plans);
    expect(result.statusById.get('t2-mon')).toBe('attended');
    expect(result.unavailableSwaps.size).toBe(0);
  });

  test('a shared session stays attended through a group in another set', () => {
    const shared = owned('shared-mon', MON, 10, 12, ['lec', 't1'], 't1');
    const result = applyAttendance([shared, t2Mon], ALL_VISIBLE, planFor({ usual: { ex: 't2' } }));
    expect(result.statusById.get('shared-mon')).toBe('attended');
  });

  test('a shared session becomes an alternative once its other group is hidden', () => {
    const shared = owned('shared-mon', MON, 10, 12, ['lec', 't1'], 't1');
    const groups = index(ref('lec', 'teaching', false), ref('t1', 'ex'), ref('t2', 'ex'));
    const result = applyAttendance([shared, t2Mon], groups, planFor({ usual: { ex: 't2' } }));
    expect(result.statusById.get('shared-mon')).toBe('alternative');
  });

  test('swapping away from a shared session keeps it while another set attends it', () => {
    const shared = owned('shared-mon', MON, 10, 12, ['lec', 't1'], 't1');
    const plans = planFor({ swaps: [{ fromSessionId: 'shared-mon', toSessionId: 't2-thu' }] });
    const result = applyAttendance([shared, t2Thu], ALL_VISIBLE, plans);
    expect(result.statusById.get('shared-mon')).toBe('attended');
    expect(result.swappedIn.has('t2-thu')).toBe(true);
  });

  test('a clash skip for one date skips only that overlapping session', () => {
    const skip = { keepSeriesKey: seriesKeyOf(networks), skipSeriesKey: seriesKeyOf(t2Mon), dateKey: MON };
    const result = applyAttendance(SESSIONS, ALL_VISIBLE, planFor({ skips: [skip] }));
    expect(sortedIds(result.skipped)).toEqual(['t2-mon']);
    expect(result.statusById.get('t2-thu')).toBe('attended');
  });

  test('an every-time skip only skips occurrences that overlap the kept series', () => {
    const skip = { keepSeriesKey: seriesKeyOf(networks), skipSeriesKey: seriesKeyOf(t2Mon), dateKey: ALL_DATES };
    const result = applyAttendance(SESSIONS, ALL_VISIBLE, planFor({ skips: [skip] }));
    expect(result.statusById.get('t2-mon')).toBe('skipped');
    expect(result.statusById.get('t2-thu')).toBe('attended');
  });

  test('a skip does nothing when the kept session is cancelled', () => {
    const skip = { keepSeriesKey: seriesKeyOf(networks), skipSeriesKey: seriesKeyOf(t2Mon), dateKey: MON };
    const sessions = [t2Mon, { ...networks, cancelled: true }];
    const result = applyAttendance(sessions, ALL_VISIBLE, planFor({ skips: [skip] }));
    expect(result.statusById.get('t2-mon')).toBe('attended');
  });
});
