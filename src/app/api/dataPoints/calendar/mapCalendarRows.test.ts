/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { CALENDAR_ROWS, CHINESE_SHARED_ROW, FIXTURE_RANGE } from './__fixtures__/calendarRows.fixture';
import { mapCalendarRows } from './mapCalendarRows';
import type { LabelPicker } from './types';

const label: LabelPicker = (value) => value?.en ?? value?.fi ?? null;

const result = mapCalendarRows(CALENDAR_ROWS, FIXTURE_RANGE, label);
const byId = (id: string) => result.sessions.find((session) => session.id === id);

describe('mapCalendarRows', () => {
  test('expands every visible series and skips rows without a realisation', () => {
    expect(result.sessions).toHaveLength(8);
    expect(result.sessions[0].id).toBe('se-chn-t2@2026-10-19#0');
  });

  test('maps a lecture across the DST change with group and course data', () => {
    const lecture = byId('se-chn-lec@2026-10-27#1');
    expect(lecture?.start.toISOString()).toBe('2026-10-27T12:00:00.000Z');
    expect(lecture?.kind).toBe('lecture');
    expect(lecture?.groupName).toBe('HDD7010 1 LAHTI Lectures for everyone');
    expect(lecture?.courseName).toBe('Basic Chinese 1');
    expect(lecture?.courseUnitId).toBe('cu-chn');
    expect(lecture?.colorIndex).toBe(2);
  });

  test('keeps populated occurrence details', () => {
    const tutorial = byId('se-chn-t2@2026-11-02#1');
    expect(tutorial?.cancelled).toBe(true);
    expect(tutorial?.locationIds).toEqual(['loc-6218']);
    expect(tutorial?.notice).toBe('Moved to lab');
    expect(tutorial?.kind).toBe('exercise');
    expect(tutorial?.groupId).toBe('sub-chn-t2');
  });

  test('classifies from the study event name when there is no group', () => {
    const cni = byId('se-cni-lec@2026-10-27#0');
    expect(cni?.kind).toBe('lecture');
    expect(cni?.groupId).toBeNull();
    expect(cni?.locationIds).toEqual([]);
  });

  test('marks exam realisations', () => {
    expect(byId('se-exam@2026-12-02#0')?.kind).toBe('exam');
  });

  test('lists courses, non-exam first, and drops rows without a realisation', () => {
    expect(result.courses.map((course) => course.realisationId)).toEqual([
      'cur-chn',
      'cur-cni',
      'cur-empty',
      'cur-exam',
    ]);
    expect(result.courses.find((course) => course.realisationId === 'cur-empty')?.isInCalendar).toBe(false);
    expect(result.courses.find((course) => course.realisationId === 'cur-exam')?.isExam).toBe(true);
  });

  test('reads real Sisu rows (offset-less times, null fields) as Helsinki time', () => {
    const lutRow = {
      enrolment: { id: 'enr-lut', courseUnitRealisationId: 'cur-lut', courseUnitId: 'cu-lut', colorIndex: 1 },
      courseUnitRealisation: {
        id: 'cur-lut',
        name: { en: 'Contact teaching, Lahti' },
        courseUnitRealisationTypeUrn: 'urn:code:course-unit-realisation-type:teaching-participation-contact',
        studyGroupSets: [],
      },
      studyEvents: [
        {
          id: 'lut-1',
          recursEvery: 'NEVER',
          startTime: '2026-10-28T14:00:00',
          duration: 'PT2H',
          recursUntil: null,
          locationIds: ['loc-aud1b'],
          events: [
            { start: '2026-10-28T14:00:00', end: '2026-10-28T16:00:00', irregularLocationIds: null, notice: null },
          ],
        },
      ],
    } as unknown as (typeof CALENDAR_ROWS)[number];
    const [session] = mapCalendarRows([lutRow], FIXTURE_RANGE, label).sessions;
    expect(session.start.toISOString()).toBe('2026-10-28T12:00:00.000Z');
    expect(session.end.toISOString()).toBe('2026-10-28T14:00:00.000Z');
    expect(session.locationIds).toEqual(['loc-aud1b']);
    expect(session.notice).toBeNull();
  });

  test('deduplicates repeated rows', () => {
    const doubled = mapCalendarRows([...CALENDAR_ROWS, CALENDAR_ROWS[1]], FIXTURE_RANGE, label);
    expect(doubled.sessions).toHaveLength(8);
    expect(doubled.courses).toHaveLength(4);
  });
});

describe('mapCalendarRows group ownership', () => {
  const shared = mapCalendarRows([CHINESE_SHARED_ROW], FIXTURE_RANGE, label);

  test('a session owned by two groups lists both and is named after the switched-on one', () => {
    const session = shared.sessions.find((item) => item.seriesId === 'se-hdd-shared');
    expect(session?.groupIds).toEqual(['sub-hdd-lec', 'sub-hdd-t1']);
    expect(session?.groupId).toBe('sub-hdd-t1');
    expect(session?.groupName).toBe('HDD7010 1 LAHTI Tutorial 1');
    expect(session?.source).toBe('sisu');
    expect(session?.locationText).toBeNull();
  });

  test('maps every group set with its range and calendar flags', () => {
    const summary = shared.courses[0].groupSets.map((set) => [
      set.id,
      set.min,
      set.max,
      set.groups.map((group) => `${group.id}:${group.isInCalendar}:${group.hasEntry}:${group.eventIds.length}`),
    ]);
    expect(summary).toEqual([
      ['set-ssg', 0, 0, ['sub-hdd-ssg:false:true:0']],
      ['set-teaching', 0, 0, ['sub-hdd-lec:false:true:1']],
      ['set-exercises', 0, 0, ['sub-hdd-t1:true:true:1', 'sub-hdd-t2:true:true:1']],
    ]);
  });

  test('groups without an enrolment entry are off and marked as having no entry', () => {
    const chinese = result.courses.find((course) => course.realisationId === 'cur-chn');
    const flags = chinese?.groupSets.flatMap((set) =>
      set.groups.map((group) => `${group.id}:${group.isInCalendar}:${group.hasEntry}`),
    );
    expect(flags).toEqual(['sub-chn-lec:false:false', 'sub-chn-t1:false:false', 'sub-chn-t2:true:true']);
  });

  test('a session with no owning group has no owners', () => {
    expect(byId('se-cni-lec@2026-10-27#0')?.groupIds).toEqual([]);
  });
});
