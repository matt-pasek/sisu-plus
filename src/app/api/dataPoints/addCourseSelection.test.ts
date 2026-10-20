/// <reference types="bun-types" />
import { describe, expect, test } from 'bun:test';
import type { Plan } from '@/app/api/generated/OsuvaApi';
import { addCourseSelection, assertCourseAddable, assertModuleInPlan } from './addCourseSelection';

const plan = {
  id: 'p',
  rootId: 'root',
  moduleSelections: [{ moduleId: 'm1', parentModuleId: 'root' }],
  courseUnitSelections: [{ courseUnitId: 'a-2024', parentModuleId: 'm1', plannedPeriods: [] }],
} as unknown as Plan;

const input = { courseUnitId: 'b', courseUnitGroupId: 'g-b', parentModuleId: 'm1', plannedPeriodLocators: ['t'] };

describe('assertModuleInPlan', () => {
  test('accepts a selected module or the plan root', () => {
    expect(() => assertModuleInPlan(plan, 'm1')).not.toThrow();
    expect(() => assertModuleInPlan(plan, 'root')).not.toThrow();
  });

  test('rejects a module that is no longer selected', () => {
    expect(() => assertModuleInPlan(plan, 'gone')).toThrow();
  });
});

describe('assertCourseAddable', () => {
  test('accepts a new course in a selected module', () => {
    expect(() => assertCourseAddable(plan, input, new Set(['g-a']))).not.toThrow();
  });

  test('rejects a course already selected by id', () => {
    expect(() => assertCourseAddable(plan, { ...input, courseUnitId: 'a-2024' }, new Set())).toThrow();
  });

  test('rejects another version of a course already in the plan', () => {
    expect(() =>
      assertCourseAddable(plan, { ...input, courseUnitId: 'a-2026', courseUnitGroupId: 'g-a' }, new Set(['g-a'])),
    ).toThrow();
  });

  test('rejects a course under a deselected module', () => {
    expect(() => assertCourseAddable(plan, { ...input, parentModuleId: 'gone' }, new Set())).toThrow();
  });

  test('an unknown group id falls back to the id check', () => {
    expect(() => assertCourseAddable(plan, { ...input, courseUnitGroupId: '' }, new Set(['']))).not.toThrow();
  });
});

describe('addCourseSelection', () => {
  test('appends the selection without touching the original plan', () => {
    const next = addCourseSelection(plan, input);
    expect(next.courseUnitSelections.map((selection) => selection.courseUnitId)).toEqual(['a-2024', 'b']);
    expect(next.courseUnitSelections[1]).toEqual({ courseUnitId: 'b', parentModuleId: 'm1', plannedPeriods: ['t'] });
    expect(plan.courseUnitSelections).toHaveLength(1);
  });

  test('is idempotent so the optimistic copy is not written twice', () => {
    const once = addCourseSelection(plan, input);
    expect(addCourseSelection(once, input)).toBe(once);
  });
});
