/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import type { Enrolment } from '@/app/api/generated/IlmoApi';
import { CHINESE_SHARED_ROW, FIXTURE_RANGE } from './__fixtures__/calendarRows.fixture';
import { mapCalendarRows } from './mapCalendarRows';
import type { LabelPicker } from './types';
import { applyVisibilityToEnrolments, applyVisibilityToRows, withCalendarFlags } from './visibility';

const label: LabelPicker = (value) => value?.en ?? value?.fi ?? null;

const fresh = {
  id: 'enr-hdd',
  metadata: { revision: 37 },
  isInCalendar: true,
  colorIndex: null,
  studySubGroups: [
    { studySubGroupId: 'sub-hdd-lec', enrolmentStudySubGroupPriority: 'NOT_SUITABLE', isInCalendar: false },
    { studySubGroupId: 'sub-hdd-t1', enrolmentStudySubGroupPriority: 'NOT_SUITABLE', isInCalendar: true },
    { studySubGroupId: 'sub-hdd-t2', enrolmentStudySubGroupPriority: 'NOT_SUITABLE', isInCalendar: true },
  ],
} as unknown as Enrolment;

const change = (groups: { groupId: string; visible: boolean }[], courseVisible?: boolean) => ({
  courseKey: 'cur-hdd',
  enrolmentId: 'enr-hdd',
  groups,
  courseVisible,
});

describe('withCalendarFlags', () => {
  test('flips only the requested group on the fresh copy', () => {
    const next = withCalendarFlags(fresh, change([{ groupId: 'sub-hdd-t1', visible: false }]));
    expect((next as { metadata?: { revision?: number } } | null)?.metadata?.revision).toBe(37);
    expect(next?.studySubGroups?.map((entry) => `${entry.studySubGroupId}:${entry.isInCalendar}`)).toEqual([
      'sub-hdd-lec:false',
      'sub-hdd-t1:false',
      'sub-hdd-t2:true',
    ]);
    expect(next?.studySubGroups?.[0]).toBe(fresh.studySubGroups?.[0]);
    expect(next?.studySubGroups?.[1].enrolmentStudySubGroupPriority).toBe('NOT_SUITABLE');
    expect(fresh.studySubGroups?.[1].isInCalendar).toBe(true);
  });

  test('refuses a group that has no entry on the enrolment', () => {
    expect(withCalendarFlags(fresh, change([{ groupId: 'sub-new', visible: true }]))).toBeNull();
  });

  test('changes only the course flag when no groups are given', () => {
    const next = withCalendarFlags(fresh, change([], false));
    expect(next?.isInCalendar).toBe(false);
    expect(next?.studySubGroups).toBe(fresh.studySubGroups);
  });
});

describe('applyVisibilityToRows', () => {
  const rows = mapCalendarRows([CHINESE_SHARED_ROW], FIXTURE_RANGE, label);

  test('hiding the only visible owner drops its sessions and updates the flag', () => {
    const next = applyVisibilityToRows(rows, change([{ groupId: 'sub-hdd-t1', visible: false }]));
    expect(next.sessions.map((session) => session.seriesId)).toEqual(['se-hdd-t2']);
    const t1 = next.courses[0].groupSets[2].groups[0];
    expect(t1.isInCalendar).toBe(false);
    expect(rows.courses[0].groupSets[2].groups[0].isInCalendar).toBe(true);
  });

  test('hiding a course drops all of its sessions', () => {
    const next = applyVisibilityToRows(rows, change([], false));
    expect(next.sessions).toEqual([]);
    expect(next.courses[0].isInCalendar).toBe(false);
  });

  test('showing a group keeps the current sessions until the refetch', () => {
    const next = applyVisibilityToRows(rows, change([{ groupId: 'sub-hdd-lec', visible: true }]));
    expect(next.sessions).toHaveLength(rows.sessions.length);
  });
});

describe('applyVisibilityToEnrolments', () => {
  const other = { ...fresh, id: 'enr-other' } as Enrolment;

  test('flips the flags on the matching enrolment only', () => {
    const [changed, untouched] = applyVisibilityToEnrolments([fresh, other], change([], false));
    expect(changed.isInCalendar).toBe(false);
    expect(untouched).toBe(other);
  });

  test('leaves the enrolment as it is when a group has no entry', () => {
    const [same] = applyVisibilityToEnrolments([fresh], change([{ groupId: 'sub-missing', visible: false }]));
    expect(same).toBe(fresh);
  });
});
