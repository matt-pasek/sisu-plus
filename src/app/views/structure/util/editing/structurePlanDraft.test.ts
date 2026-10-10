/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import type { Plan } from '@/app/api/generated/OsuvaApi';

import { getSubstituteIds, removeCourseFromPlan, selectCourseOption, selectModuleOption } from './structurePlanDraft';

const plan = {
  id: 'plan',
  rootId: 'degree',
  moduleSelections: [
    { moduleId: 'degree' },
    { moduleId: 'minor', parentModuleId: 'degree' },
    { moduleId: 'finnish', parentModuleId: 'minor' },
  ],
  courseUnitSelections: [
    { courseUnitId: 'finnish-3', parentModuleId: 'finnish' },
    { courseUnitId: 'work-1', parentModuleId: 'finnish', substitutedBy: ['finnish-5'] },
    { courseUnitId: 'finnish-5', substituteFor: [{ substitutedCourseUnitId: 'work-1' }] },
    { courseUnitId: 'networks', parentModuleId: 'major' },
  ],
} as unknown as Plan;

const courseIds = (draft: Plan) => draft.courseUnitSelections.map((selection) => selection.courseUnitId);

describe('substitution guard', () => {
  test('removing a substituted course also removes its substitute', () => {
    const draft = removeCourseFromPlan(plan, 'work-1');

    expect(courseIds(draft)).toEqual(['finnish-3', 'networks']);
  });

  test('replacing the module that holds a substituted course removes the substitute', () => {
    const draft = selectModuleOption(plan, {
      parentModuleId: 'minor',
      selectedModuleId: 'swedish',
      optionModuleIds: ['finnish', 'swedish'],
    });

    expect(courseIds(draft)).toEqual(['networks']);
  });

  test('choosing another course option drops the substitute of the replaced option', () => {
    const draft = selectCourseOption(plan, {
      parentModuleId: 'finnish',
      selectedCourseUnitId: 'finnish-3',
      optionCourseUnitIds: ['finnish-3', 'work-1'],
    });

    expect(courseIds(draft)).toEqual(['finnish-3', 'networks']);
  });

  test('keeps a substitute that still replaces another selected course', () => {
    const shared = {
      ...plan,
      courseUnitSelections: [
        { courseUnitId: 'work-1', parentModuleId: 'finnish', substitutedBy: ['combined'] },
        { courseUnitId: 'work-2', parentModuleId: 'finnish', substitutedBy: ['combined'] },
        {
          courseUnitId: 'combined',
          substituteFor: [{ substitutedCourseUnitId: 'work-1' }, { substitutedCourseUnitId: 'work-2' }],
        },
      ],
    } as unknown as Plan;

    const draft = removeCourseFromPlan(shared, 'work-1');

    expect(draft.courseUnitSelections).toEqual([
      { courseUnitId: 'work-2', parentModuleId: 'finnish', substitutedBy: ['combined'] },
      { courseUnitId: 'combined', substituteFor: [{ substitutedCourseUnitId: 'work-2' }] },
    ]);
  });

  test('leaves unrelated selections untouched by reference', () => {
    const draft = removeCourseFromPlan(plan, 'finnish-3');

    expect(draft.courseUnitSelections[0]).toBe(plan.courseUnitSelections[1]);
    expect(draft.courseUnitSelections[1]).toBe(plan.courseUnitSelections[2]);
  });
});

describe('removing a course from search', () => {
  test('removes a course that sits in a module nested under the section', () => {
    const draft = removeCourseFromPlan(plan, 'finnish-3');

    expect(courseIds(draft)).toEqual(['work-1', 'finnish-5', 'networks']);
  });

  test('removing a substitute brings back the course it replaced', () => {
    const draft = removeCourseFromPlan(plan, 'finnish-5');

    expect(draft.courseUnitSelections).toEqual([
      { courseUnitId: 'finnish-3', parentModuleId: 'finnish' },
      { courseUnitId: 'work-1', parentModuleId: 'finnish', substitutedBy: [] },
      { courseUnitId: 'networks', parentModuleId: 'major' },
    ]);
  });
});

describe('getSubstituteIds', () => {
  test('returns the substitutes present in the plan', () => {
    expect(getSubstituteIds(plan, 'work-1')).toEqual(['finnish-5']);
  });

  test('ignores substitutes that are no longer in the plan', () => {
    const draft = {
      ...plan,
      courseUnitSelections: plan.courseUnitSelections.filter((selection) => selection.courseUnitId !== 'finnish-5'),
    };

    expect(getSubstituteIds(draft, 'work-1')).toEqual([]);
  });
});
