/// <reference types="bun-types" />
import { describe, expect, test } from 'bun:test';
import { makePeriod } from './__fixtures__/timeline';
import { toCandidateCourse } from './candidateCourse';

describe('toCandidateCourse', () => {
  const period = makePeriod({ locator: 'p2' });
  const candidate = toCandidateCourse({
    option: { courseUnitId: 'cu-1', courseUnitGroupId: 'g-1', code: 'CT60A5540', name: 'Networks', credits: 6 },
    sectionId: 'section-1',
    sectionName: 'Major studies',
    parentModuleId: 'module-1',
    plannedPeriods: [period],
  });

  test('carries the option into the section it would be added under', () => {
    expect(candidate).toMatchObject({
      courseUnitId: 'cu-1',
      courseUnitGroupId: 'g-1',
      courseCode: 'CT60A5540',
      courseName: 'Networks',
      credits: 6,
      moduleId: 'section-1',
      moduleName: 'Major studies',
      parentModuleId: 'module-1',
      plannedPeriods: [period],
    });
  });

  test('starts as an unfinished, unenrolled course with no known teaching', () => {
    expect(candidate).toMatchObject({
      completionPeriod: null,
      attainmentDate: null,
      isPassed: false,
      grade: null,
      isEnrolled: false,
      teachingPeriodLocators: [],
    });
  });
});
