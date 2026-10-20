/// <reference types="bun-types" />
import { describe, expect, test } from 'bun:test';

import type { PlanCourseOption, PlanOptionGroup } from '@/app/api/dataPoints/planOptions/buildOptionGroups';
import type { RuleRange } from '@/app/api/dataPoints/structure/ruleTree';

import { makePeriod } from './__fixtures__/timeline';
import type { TeachingWindow } from './periodFit';
import { buildPeriodSuggestions, isGroupVisible } from './periodSuggestions';

const target = makePeriod({ locator: 't', name: '3. period', startDate: '2027-01-01', endDate: '2027-03-01' });
const opt = (id: string, credits: number | null = 5, groupId = `g-${id}`): PlanCourseOption => ({
  courseUnitId: id,
  courseUnitGroupId: groupId,
  code: id,
  name: id,
  credits,
  required: false,
});
const group = (id: string, options: PlanCourseOption[], range: Partial<RuleRange> = {}): PlanOptionGroup => ({
  id,
  sectionId: 's',
  sectionName: 'S',
  moduleId: 'm',
  moduleName: 'M',
  title: null,
  min: null,
  max: null,
  creditsMin: null,
  creditsMax: null,
  ...range,
  options,
});
const taughtNow = [{ startDate: '2027-01-10', endDate: '2027-02-20' }];
const run = (groups: PlanOptionGroup[], plannedGroupIds: string[], teaching: Record<string, TeachingWindow[]>) =>
  buildPeriodSuggestions({
    groups,
    planGroupIds: new Set(plannedGroupIds),
    teaching: new Map(Object.entries(teaching)),
    periods: [target],
    targetLocator: 't',
  });

describe('buildPeriodSuggestions', () => {
  test('hides planned options and splits taught from not taught', () => {
    const [g] = run([group('g1', [opt('a'), opt('b'), opt('c')])], ['g-a'], { b: taughtNow });
    expect(g.taught.map((s) => s.option.courseUnitId)).toEqual(['b']);
    expect(g.notTaught.map((s) => s.option.courseUnitId)).toEqual(['c']);
  });

  test('credit progress counts options already in the plan', () => {
    expect(run([group('g1', [opt('a', 6), opt('b', null)], { creditsMin: 30 })], ['g-a'], {})[0].progress).toEqual({
      kind: 'credits',
      done: 6,
      target: 30,
    });
  });

  test('count progress and a full group disappears', () => {
    expect(run([group('g1', [opt('a'), opt('b'), opt('c')], { min: 1, max: 1 })], [], {})[0].progress).toEqual({
      kind: 'count',
      pick: 1,
      of: 3,
    });
    expect(run([group('g1', [opt('a'), opt('b')], { max: 1 })], ['g-a'], {})).toEqual([]);
  });

  test('another version of a planned course is hidden and counts toward progress', () => {
    const [g] = run([group('g1', [opt('a-2026', 6, 'g-a'), opt('b')], { creditsMin: 30 })], ['g-a'], {});
    expect([...g.taught, ...g.notTaught].map((s) => s.option.courseUnitId)).toEqual(['b']);
    expect(g.progress).toEqual({ kind: 'credits', done: 6, target: 30 });
  });

  test('another version of a planned course fills a max-one group', () => {
    expect(run([group('g1', [opt('a-2026', 5, 'g-a'), opt('b')], { max: 1 })], ['g-a'], {})).toEqual([]);
  });

  test('a passed course is not offered', () => {
    const passedGroupIds = ['g-done'];
    const [g] = run([group('g1', [opt('done-2026', 5, 'g-done'), opt('b')])], passedGroupIds, { b: taughtNow });
    expect([...g.taught, ...g.notTaught].map((s) => s.option.courseUnitId)).toEqual(['b']);
  });

  test('a course listed in two groups shows in both until it is planned', () => {
    const groups = [group('g1', [opt('x'), opt('y')]), group('g2', [opt('x'), opt('z')])];
    expect(run(groups, [], { x: taughtNow }).map((g) => g.taught.map((s) => s.option.courseUnitId))).toEqual([
      ['x'],
      ['x'],
    ]);
    expect(
      run(groups, ['g-x'], { x: taughtNow }).flatMap((g) =>
        [...g.taught, ...g.notTaught].map((s) => s.option.courseUnitId),
      ),
    ).toEqual(['y', 'z']);
  });

  test('taught courses list confirmed before likely, then by name', () => {
    const lastYear = makePeriod({
      locator: 'p0',
      name: '3. period',
      studyYear: 2026,
      startDate: '2026-01-01',
      endDate: '2026-03-01',
    });
    const result = buildPeriodSuggestions({
      groups: [group('g1', [opt('c'), opt('b'), opt('a')])],
      planGroupIds: new Set(),
      teaching: new Map([
        ['a', [{ startDate: '2026-01-10', endDate: '2026-02-20' }]],
        ['b', taughtNow],
        ['c', taughtNow],
      ]),
      periods: [lastYear, { ...target, studyYear: 2027 }],
      targetLocator: 't',
    });
    expect(result[0].taught.map((s) => [s.option.courseUnitId, s.fit?.certainty])).toEqual([
      ['b', 'confirmed'],
      ['c', 'confirmed'],
      ['a', 'likely'],
    ]);
  });
});

describe('keepVisibleId and skipIds', () => {
  const base = (extra: object) => ({
    groups: [group('g1', [opt('a', 6), opt('b', 4)], { creditsMin: 30, max: 1 })],
    planGroupIds: new Set(['g-a']),
    teaching: new Map([['a', taughtNow]]),
    periods: [target],
    targetLocator: 't',
    ...extra,
  });

  test('a kept-visible id stays listed while still counting toward progress', () => {
    const [g] = buildPeriodSuggestions(base({ keepVisibleId: 'a' }));
    expect(g.taught.map((s) => s.option.courseUnitId)).toEqual(['a']);
    expect(g.progress).toEqual({ kind: 'credits', done: 6, target: 30 });
  });

  test('without keepVisibleId a full group disappears', () => {
    expect(buildPeriodSuggestions(base({}))).toEqual([]);
  });

  test('skipIds leave a course out of both lists', () => {
    const [g] = buildPeriodSuggestions({
      ...base({ planGroupIds: new Set(), skipIds: new Set(['b']) }),
      groups: [group('g1', [opt('a'), opt('b')])],
    });
    expect([...g.taught, ...g.notTaught].map((s) => s.option.courseUnitId)).toEqual(['a']);
  });

  test('isGroupVisible matches the build rules', () => {
    const g = group('g1', [opt('a'), opt('b')], { max: 1 });
    expect(isGroupVisible(g, new Set())).toBe(true);
    expect(isGroupVisible(g, new Set(['g-a']))).toBe(false);
    expect(isGroupVisible(g, new Set(['g-a']), 'a')).toBe(true);
    expect(isGroupVisible(group('g2', [opt('a')]), new Set(['g-a']))).toBe(false);
    expect(isGroupVisible(g, new Set(['a']))).toBe(true);
  });
});
