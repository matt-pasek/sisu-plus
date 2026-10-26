/// <reference types="bun-types" />
import { describe, expect, test } from 'bun:test';

import type { PlanCourseOption, PlanOptionGroup } from '@/app/api/dataPoints/planOptions/buildOptionGroups';

import { isSearchResultPlanned, resolveSearchGroupId, routeSearchResult } from './searchRouting';

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
  moduleId: `m-${id}`,
  moduleName: `M ${id}`,
  title: null,
  min: null,
  max,
  creditsMin: null,
  creditsMax: null,
  options,
});

describe('routeSearchResult', () => {
  const groups = [group('g1', [opt('a-2026', 'g-a'), opt('b')], 1), group('g2', [opt('c')])];

  test('a listed course goes to its visible group as the curriculum version', () => {
    const route = routeSearchResult({ groupId: 'g-c', groups, planGroupIds: new Set(), keepVisibleId: null });
    expect(route.kind).toBe('listed');
    if (route.kind !== 'listed') return;
    expect(route.group.moduleId).toBe('m-g2');
    expect(route.option.courseUnitId).toBe('c');
  });

  test('a listed course in a full group is reported as full', () => {
    const route = routeSearchResult({ groupId: 'g-a', groups, planGroupIds: new Set(['g-b']), keepVisibleId: null });
    expect(route.kind).toBe('full');
    if (route.kind !== 'full') return;
    expect(route.group.moduleName).toBe('M g1');
  });

  test('the course just added keeps its listed route', () => {
    const route = routeSearchResult({
      groupId: 'g-a',
      groups,
      planGroupIds: new Set(['g-a']),
      keepVisibleId: 'a-2026',
    });
    expect(route.kind).toBe('listed');
  });

  test('an unlisted or unknown course goes to free search', () => {
    expect(routeSearchResult({ groupId: 'g-x', groups, planGroupIds: new Set(), keepVisibleId: null }).kind).toBe(
      'free',
    );
    expect(routeSearchResult({ groupId: null, groups, planGroupIds: new Set(), keepVisibleId: null }).kind).toBe(
      'free',
    );
  });
});

describe('isSearchResultPlanned', () => {
  const planGroupIds = new Set(['g-a']);
  const planCourseUnitIds = new Set(['old-id']);

  test('matches by group so another version counts as planned', () => {
    expect(isSearchResultPlanned({ courseUnitId: 'a-2026', groupId: 'g-a' }, planGroupIds, planCourseUnitIds)).toBe(
      true,
    );
    expect(isSearchResultPlanned({ courseUnitId: 'b', groupId: 'g-b' }, planGroupIds, planCourseUnitIds)).toBe(false);
  });

  test('falls back to the id when the result has no group', () => {
    expect(isSearchResultPlanned({ courseUnitId: 'old-id', groupId: null }, planGroupIds, planCourseUnitIds)).toBe(
      true,
    );
  });
});

describe('resolveSearchGroupId', () => {
  test('keeps the group id the search returned', () => {
    const known = new Map([['cu1', 'g-teaching']]);
    expect(resolveSearchGroupId({ courseUnitId: 'cu1', groupId: 'g-search' }, known)).toBe('g-search');
  });

  test('falls back to the group id found in the teaching data, so a listed course is not offered as free', () => {
    const known = new Map([['cu1', 'g-teaching']]);
    expect(resolveSearchGroupId({ courseUnitId: 'cu1', groupId: null }, known)).toBe('g-teaching');
  });

  test('stays unknown until teaching data arrives', () => {
    expect(resolveSearchGroupId({ courseUnitId: 'cu1', groupId: null }, new Map())).toBeNull();
  });
});
