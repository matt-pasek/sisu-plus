/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { buildSession } from '@/app/schedule/__fixtures__/buildSession';
import { pairKey, seriesKeyOf } from '@/app/schedule';
import { CHINESE_SHARED_ROW, FIXTURE_RANGE } from './__fixtures__/calendarRows.fixture';
import { mapCalendarRows } from './mapCalendarRows';
import { pruneBase, visibleGroupIdsOf } from './pruneContext';
import type { LabelPicker } from './types';

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
});

describe('visibleGroupIdsOf', () => {
  test('lists switched-on groups even when the course is hidden', () => {
    const [course] = mapCalendarRows([CHINESE_SHARED_ROW], FIXTURE_RANGE, label).courses;
    expect([...visibleGroupIdsOf({ ...course, isInCalendar: false })]).toEqual(['sub-hdd-t1', 'sub-hdd-t2']);
  });
});
