/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { buildSession } from '@/app/schedule/__fixtures__/buildSession';
import { pairKey, seriesKeyOf } from '@/app/schedule';
import { CHINESE_SHARED_ROW, FIXTURE_RANGE } from './__fixtures__/calendarRows.fixture';
import { mapCalendarRows } from './mapCalendarRows';
import { pruneBase, pruneReady, visibleGroupIdsOf } from './pruneContext';
import type { LabelPicker, LinkedTimetableState, PruneReadiness } from './types';

const label: LabelPicker = (value) => value?.en ?? value?.fi ?? null;

describe('pruneBase', () => {
  const t2 = buildSession('t2-mon', '2026-10-05', 16, 18, { courseKey: 'c', groupId: 't2', groupIds: ['t2'] });
  const lab = buildSession('lab-mon', '2026-10-05', 16, 17, { courseKey: 'net' });
  const candidate = buildSession('t1-mon', '2026-10-05', 14, 16, { courseKey: 'c', groupId: 't1', groupIds: ['t1'] });
  const base = pruneBase(FIXTURE_RANGE, [t2, lab], [candidate], []);

  test('knows visible and candidate session ids and series', () => {
    expect([...base.sessionIds].sort()).toEqual(['lab-mon', 't1-mon', 't2-mon']);
    expect(base.seriesKeys.has(seriesKeyOf(candidate))).toBe(true);
  });

  test('records overlapping series pairs among visible sessions', () => {
    expect(base.overlappingPairs.has(pairKey(seriesKeyOf(t2), seriesKeyOf(lab)))).toBe(true);
  });

  test('records pairs where a swapped-in candidate overlaps a visible session', () => {
    const lecture = buildSession('lec-mon', '2026-10-05', 15, 16, { courseKey: 'net' });
    const withSwapIn = pruneBase(FIXTURE_RANGE, [lecture], [candidate], []);
    expect(withSwapIn.overlappingPairs.has(pairKey(seriesKeyOf(candidate), seriesKeyOf(lecture)))).toBe(true);
  });
});

describe('visibleGroupIdsOf', () => {
  test('lists switched-on groups even when the course is hidden', () => {
    const [course] = mapCalendarRows([CHINESE_SHARED_ROW], FIXTURE_RANGE, label).courses;
    expect([...visibleGroupIdsOf({ ...course, isInCalendar: false })]).toEqual(['sub-hdd-t1', 'sub-hdd-t2']);
  });
});

describe('pruneReady', () => {
  const linked = (status: LinkedTimetableState['status']): LinkedTimetableState => ({
    url: 'https://cloud.timeedit.net/x.ics',
    label: 'TimeEdit',
    status,
    reason: null,
    fetchedAt: null,
    count: 0,
  });
  const ready: PruneReadiness = {
    plansLoaded: true,
    rowsSettled: true,
    candidatesSettled: true,
    extraCoursesSettled: true,
    linksLoaded: true,
    linkedStates: [linked('ok'), linked('stale')],
  };

  test('prunes once every source has loaded', () => {
    expect(pruneReady(ready)).toBe(true);
  });

  test('waits while linked timetables load or after one failed without a cache', () => {
    expect(pruneReady({ ...ready, linkedStates: [linked('ok'), linked('loading')] })).toBe(false);
    expect(pruneReady({ ...ready, linkedStates: [linked('error')] })).toBe(false);
  });

  test('waits for stored links and for courses Sisu leaves out of the calendar rows', () => {
    expect(pruneReady({ ...ready, linksLoaded: false })).toBe(false);
    expect(pruneReady({ ...ready, extraCoursesSettled: false })).toBe(false);
  });
});
