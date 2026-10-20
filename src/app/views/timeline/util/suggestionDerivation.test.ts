/// <reference types="bun-types" />
import { describe, expect, test } from 'bun:test';

import type { PlanCourseOption, PlanOptionGroup } from '@/app/api/dataPoints/planOptions/buildOptionGroups';

import { makeCourse, makePeriod } from './__fixtures__/timeline';
import type { SuggestionGroup } from './periodSuggestions';
import {
  buildPrerequisitesById,
  countUncheckedCourses,
  formatCreditAmount,
  getPlanGroupIds,
  getRemainingOptionIds,
} from './suggestionDerivation';

const opt = (id: string, groupId = `g-${id}`): PlanCourseOption => ({
  courseUnitId: id,
  courseUnitGroupId: groupId,
  code: id,
  name: id,
  credits: 5,
  required: false,
});
const group = (id: string, options: PlanCourseOption[], max: number | null = null): PlanOptionGroup => ({
  id,
  sectionId: 's',
  sectionName: 'S',
  moduleId: 'm',
  moduleName: 'M',
  title: null,
  min: null,
  max,
  creditsMin: null,
  creditsMax: null,
  options,
});

describe('getRemainingOptionIds', () => {
  const groups = [group('g1', [opt('a'), opt('b')], 1), group('g2', [opt('b'), opt('c')])];

  test('skips full groups, planned options and duplicates', () => {
    expect(getRemainingOptionIds({ groups, planGroupIds: new Set(['g-a']), keepVisibleId: null })).toEqual(['b', 'c']);
  });

  test('skips another version of a planned course', () => {
    const versioned = [group('g1', [opt('a-2026', 'g-a'), opt('b')])];
    expect(getRemainingOptionIds({ groups: versioned, planGroupIds: new Set(['g-a']), keepVisibleId: null })).toEqual([
      'b',
    ]);
  });

  test('keeps the kept-visible id and its group', () => {
    expect(getRemainingOptionIds({ groups, planGroupIds: new Set(['g-a']), keepVisibleId: 'a' })).toEqual([
      'a',
      'b',
      'c',
    ]);
  });
});

describe('buildPrerequisitesById', () => {
  test('covers taught suggestions only and ignores the candidate itself in courses', () => {
    const period = makePeriod({ locator: 't', name: '3. period', startDate: '2027-01-01', endDate: '2027-03-01' });
    const g = group('g1', [opt('a'), opt('b')]);
    const groups: SuggestionGroup[] = [
      {
        group: g,
        progress: null,
        taught: [{ option: opt('a'), group: g, fit: { certainty: 'confirmed', periodLocators: ['t'] } }],
        notTaught: [{ option: opt('b'), group: g, fit: null }],
      },
    ];
    const result = buildPrerequisitesById({
      groups,
      prerequisites: new Map(),
      courses: [makeCourse({ courseUnitId: 'a' })],
      attainments: [],
      studyPeriodMap: new Map([['t', period]]),
    });
    expect([...result.keys()]).toEqual(['a']);
    expect(result.get('a')).toEqual({ unmet: [], plannedOnly: [] });
  });
});

describe('countUncheckedCourses', () => {
  const groups = [group('g1', [opt('a'), opt('b')], 1), group('g2', [opt('c')])];

  test('counts failed ids that belong to visible groups', () => {
    const failedIds = new Set(['a', 'b', 'c']);
    expect(countUncheckedCourses({ groups, planGroupIds: new Set(['g-a']), keepVisibleId: null, failedIds })).toBe(1);
    expect(countUncheckedCourses({ groups, planGroupIds: new Set(), keepVisibleId: null, failedIds })).toBe(3);
  });

  test('is zero when nothing failed', () => {
    expect(countUncheckedCourses({ groups, planGroupIds: new Set(), keepVisibleId: null, failedIds: new Set() })).toBe(
      0,
    );
  });
});

describe('getPlanGroupIds', () => {
  test('joins planned course groups, passed groups and groups of selected option versions', () => {
    const result = getPlanGroupIds({
      courses: [makeCourse({ courseUnitId: 'a', courseUnitGroupId: 'g-a' }), makeCourse({ courseUnitId: 'n' })],
      passedGroupIds: new Set(['g-passed']),
      selectedCourseUnitIds: new Set(['substituted']),
      groups: [group('g1', [opt('substituted', 'g-sub'), opt('free')])],
    });
    expect([...result].sort()).toEqual(['g-a', 'g-passed', 'g-sub']);
  });
});

describe('formatCreditAmount', () => {
  test('rounds fractional sums', () => {
    expect(formatCreditAmount(0.1 + 0.2)).toBe('0.3');
    expect(formatCreditAmount(24)).toBe('24');
  });
});
