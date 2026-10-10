/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import type { Plan } from '@/app/api/generated/OsuvaApi';
import type { StructureOption, StructureSelectionGroup } from '@/app/views/structure/types';

import { chooseGroupOption, isGroupFull } from './selectionGroupChoice';

const courseOption = (id: string): StructureOption => ({
  id,
  groupId: id,
  type: 'course',
  code: id,
  name: id,
  credits: 5,
  selected: false,
});

const moduleOption = (id: string): StructureOption => ({ ...courseOption(id), type: 'module' });

const group = (max: number | null, options: StructureOption[]): StructureSelectionGroup => ({
  id: 'group',
  parentModuleId: 'section',
  title: 'Group',
  instructions: null,
  min: 0,
  max,
  creditsMin: null,
  creditsMax: null,
  options,
});

const planWith = (courseUnitIds: string[], moduleSelections: Plan['moduleSelections'] = []) =>
  ({
    rootId: 'degree',
    moduleSelections,
    courseUnitSelections: courseUnitIds.map((courseUnitId) => ({ courseUnitId, parentModuleId: 'section' })),
  }) as unknown as Plan;

const courseIds = (plan: Plan) => plan.courseUnitSelections.map((selection) => selection.courseUnitId);

const courses = ['a', 'b', 'c'].map(courseOption);

describe('chooseGroupOption', () => {
  test('adds to a multi-select group without dropping the other selections', () => {
    const next = chooseGroupOption(planWith(['a']), group(null, courses), courses[1]);

    expect(courseIds(next)).toEqual(['a', 'b']);
  });

  test('deselects an already selected option in a multi-select group', () => {
    const next = chooseGroupOption(planWith(['a', 'b']), group(null, courses), courses[0]);

    expect(courseIds(next)).toEqual(['b']);
  });

  test('refuses to exceed the group maximum', () => {
    const plan = planWith(['a', 'b']);

    expect(chooseGroupOption(plan, group(2, courses), courses[2])).toBe(plan);
  });

  test('replaces the current choice in a single-choice group', () => {
    const next = chooseGroupOption(planWith(['a']), group(1, courses), courses[1]);

    expect(courseIds(next)).toEqual(['b']);
  });

  test('deselecting a module in a multi-select group removes its nested courses', () => {
    const modules = ['m1', 'm2'].map(moduleOption);
    const plan = {
      ...planWith([]),
      moduleSelections: [
        { moduleId: 'm1', parentModuleId: 'section' },
        { moduleId: 'm2', parentModuleId: 'section' },
      ],
      courseUnitSelections: [
        { courseUnitId: 'x', parentModuleId: 'm1' },
        { courseUnitId: 'y', parentModuleId: 'm2' },
      ],
    } as unknown as Plan;

    const next = chooseGroupOption(plan, group(null, modules), modules[0]);

    expect(next.moduleSelections.map((selection) => selection.moduleId)).toEqual(['m2']);
    expect(courseIds(next)).toEqual(['y']);
  });

  test('adds a module to a multi-select group under the group parent', () => {
    const modules = ['m1', 'm2'].map(moduleOption);
    const plan = planWith([], [{ moduleId: 'm1', parentModuleId: 'section' }]);

    const next = chooseGroupOption(plan, group(null, modules), modules[1]);

    expect(next.moduleSelections).toEqual([
      { moduleId: 'm1', parentModuleId: 'section' },
      { moduleId: 'm2', parentModuleId: 'section' },
    ]);
  });
});

describe('isGroupFull', () => {
  test('is full once the selected options reach the maximum', () => {
    expect(isGroupFull(group(2, courses), planWith(['a', 'b']))).toBe(true);
    expect(isGroupFull(group(2, courses), planWith(['a']))).toBe(false);
  });

  test('never treats single-choice or unbounded groups as full', () => {
    expect(isGroupFull(group(1, courses), planWith(['a']))).toBe(false);
    expect(isGroupFull(group(null, courses), planWith(['a', 'b', 'c']))).toBe(false);
  });
});
