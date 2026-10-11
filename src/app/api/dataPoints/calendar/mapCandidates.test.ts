/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { CHINESE_SHARED_ROW, FIXTURE_RANGE } from './__fixtures__/calendarRows.fixture';
import { mapCalendarRows } from './mapCalendarRows';
import { mapCandidateSessions } from './mapCandidates';
import type { LabelPicker, StudyEventLike } from './types';

const label: LabelPicker = (value) => value?.en ?? value?.fi ?? null;
const [course] = mapCalendarRows([CHINESE_SHARED_ROW], FIXTURE_RANGE, label).courses;
const events = (CHINESE_SHARED_ROW.studyEvents ?? []) as unknown as StudyEventLike[];

describe('mapCandidateSessions', () => {
  const sessions = mapCandidateSessions(course, events, FIXTURE_RANGE, label);

  test('creates one session per owning group with all owners listed', () => {
    expect(sessions.map((session) => `${session.groupId}:${session.seriesId}`)).toEqual([
      'sub-hdd-lec:se-hdd-shared',
      'sub-hdd-t1:se-hdd-shared',
      'sub-hdd-t2:se-hdd-t2',
    ]);
    expect(sessions[0].groupIds).toEqual(['sub-hdd-lec', 'sub-hdd-t1']);
    expect(sessions[0].id).toBe(sessions[1].id);
  });

  test('classifies each copy from its own group', () => {
    expect(sessions.map((session) => session.kind)).toEqual(['lecture', 'exercise', 'exercise']);
  });

  test('skips cancelled groups', () => {
    const cancelled = {
      ...course,
      groupSets: course.groupSets.map((set) => ({
        ...set,
        groups: set.groups.map((group) => ({ ...group, cancelled: group.id === 'sub-hdd-t2' })),
      })),
    };
    expect(mapCandidateSessions(cancelled, events, FIXTURE_RANGE, label).map((s) => s.groupId)).not.toContain(
      'sub-hdd-t2',
    );
  });
});
