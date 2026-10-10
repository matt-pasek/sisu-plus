/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { buildCuToTopModuleMap } from './buildCuToTopModuleMap';
import { getPlacedCourseUnitSelections } from './placedCourseUnitSelections';

const plan = {
  rootId: 'degree',
  moduleSelections: [
    { moduleId: 'degree' },
    { moduleId: 'minor', parentModuleId: 'degree' },
    { moduleId: 'major', parentModuleId: 'degree' },
    { moduleId: 'finnish', parentModuleId: 'minor' },
  ],
  courseUnitSelections: [
    { courseUnitId: 'finnish-3', parentModuleId: 'finnish', completionMethodId: 'cm-3' },
    { courseUnitId: 'work-1', parentModuleId: 'finnish', substitutedBy: ['finnish-5'] },
    { courseUnitId: 'finnish-5', completionMethodId: 'cm-5', substituteFor: [{ substitutedCourseUnitId: 'work-1' }] },
    { courseUnitId: 'networks', parentModuleId: 'major' },
  ],
};

describe('getPlacedCourseUnitSelections', () => {
  test('places a substitute in the module of the course it substitutes', () => {
    const placed = getPlacedCourseUnitSelections(plan.courseUnitSelections);

    expect(placed.find((s) => s.courseUnitId === 'finnish-5')?.parentModuleId).toBe('finnish');
  });

  test('drops a course that has been substituted', () => {
    const placed = getPlacedCourseUnitSelections(plan.courseUnitSelections);

    expect(placed.map((s) => s.courseUnitId)).toEqual(['finnish-3', 'finnish-5', 'networks']);
  });

  test('keeps a course whose substitute is not in the plan', () => {
    const placed = getPlacedCourseUnitSelections([
      { courseUnitId: 'work-1', parentModuleId: 'finnish', substitutedBy: ['missing'] },
    ]);

    expect(placed.map((s) => s.courseUnitId)).toEqual(['work-1']);
  });

  test('does not mutate the input selections', () => {
    const selections = structuredClone(plan.courseUnitSelections);

    getPlacedCourseUnitSelections(selections);

    expect(selections).toEqual(plan.courseUnitSelections);
  });
});

describe('buildCuToTopModuleMap', () => {
  test('maps a substitute to the top-level module of the substituted course', () => {
    const map = buildCuToTopModuleMap(plan);

    expect(map.get('finnish-5')).toBe('minor');
    expect(map.has('work-1')).toBe(false);
    expect(map.get('networks')).toBe('major');
  });
});
