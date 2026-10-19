/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { CHINESE_SHARED_ROW, FIXTURE_RANGE } from './__fixtures__/calendarRows.fixture';
import { groupIndex, toGroupRefs } from './groupRefs';
import { mapCalendarRows } from './mapCalendarRows';
import type { LabelPicker } from './types';

const label: LabelPicker = (value) => value?.en ?? value?.fi ?? null;
const { courses } = mapCalendarRows([CHINESE_SHARED_ROW], FIXTURE_RANGE, label);

describe('toGroupRefs', () => {
  test('lists every group with its set and visibility', () => {
    expect(toGroupRefs(courses).map((ref) => `${ref.id}:${ref.setId}:${ref.visible}`)).toEqual([
      'sub-hdd-ssg:set-ssg:false',
      'sub-hdd-lec:set-teaching:false',
      'sub-hdd-t1:set-exercises:true',
      'sub-hdd-t2:set-exercises:true',
    ]);
  });

  test('a hidden course hides all of its groups', () => {
    const hidden = courses.map((course) => ({ ...course, isInCalendar: false }));
    expect(toGroupRefs(hidden).some((ref) => ref.visible)).toBe(false);
  });

  test('indexes refs by id', () => {
    expect(groupIndex(toGroupRefs(courses)).get('sub-hdd-t2')?.courseKey).toBe('cur-hdd');
  });
});
