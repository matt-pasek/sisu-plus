/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { CHINESE_SHARED_ROW, FIXTURE_RANGE } from '@/app/api/dataPoints/calendar/__fixtures__/calendarRows.fixture';
import { mapCalendarRows } from '@/app/api/dataPoints/calendar/mapCalendarRows';
import { buildSession } from '@/app/schedule/__fixtures__/buildSession';
import { findClashes, groupClashesBySession, type GroupRef } from '@/app/schedule';
import { clashPartner, groupContext, groupMenuFor, swapSuggestionFor } from './popover';

const COURSE = 'cur-hdd';
const groups = new Map<string, GroupRef>([
  ['t1', { id: 't1', courseKey: COURSE, setId: 'ex', visible: false }],
  ['t2', { id: 't2', courseKey: COURSE, setId: 'ex', visible: true }],
]);
const t2Mon = buildSession('t2-mon', '2026-10-05', 16, 18, {
  courseKey: COURSE,
  groupId: 't2',
  groupIds: ['t2'],
  kind: 'exercise',
});
const t1Mon = buildSession('t1-mon', '2026-10-05', 14, 16, {
  courseKey: COURSE,
  groupId: 't1',
  groupIds: ['t1'],
  kind: 'exercise',
});
const lab = buildSession('lab-mon', '2026-10-05', 16, 17, { courseKey: 'cur-net', kind: 'lab' });
const attended = [t2Mon, lab];
const clashesBySession = groupClashesBySession(findClashes(attended));

describe('popover helpers', () => {
  test('finds the clash partner', () => {
    expect(clashPartner(t2Mon, clashesBySession, new Map(attended.map((s) => [s.id, s])))?.id).toBe('lab-mon');
  });

  test('suggests a free slot and respects a dismissed clash', () => {
    const suggestion = swapSuggestionFor(t2Mon, clashesBySession, attended, [t1Mon], groups, []);
    expect(suggestion?.target.id).toBe('t1-mon');
    expect(suggestion?.swap).toEqual({ fromSessionId: 't2-mon', toSessionId: 't1-mon' });
    expect(
      swapSuggestionFor(t2Mon, clashesBySession, attended, [t1Mon], groups, [suggestion?.clashId ?? '']),
    ).toBeNull();
  });

  test('offers to switch tutorials and to hide a lecture group', () => {
    const label = (value: { en?: string; fi?: string } | null | undefined) => value?.en ?? value?.fi ?? null;
    const { courses, sessions } = mapCalendarRows([CHINESE_SHARED_ROW], FIXTURE_RANGE, label);
    const tutorial = sessions.find((session) => session.groupId === 'sub-hdd-t2');
    const context = tutorial ? groupContext(tutorial, courses[0]) : null;
    expect(context?.set.id).toBe('set-exercises');
    expect(tutorial && context ? groupMenuFor(tutorial, context) : null).toBe('switch');
    const lecture = tutorial ? { ...tutorial, kind: 'lecture' as const } : null;
    expect(lecture && context ? groupMenuFor(lecture, context) : null).toBe('hide');
  });
});
