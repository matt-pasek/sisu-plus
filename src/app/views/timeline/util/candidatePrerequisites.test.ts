/// <reference types="bun-types" />
import { describe, expect, test } from 'bun:test';
import type { PrerequisiteInfo } from '@/app/api/resolvers/resolvePrerequisites';
import type { CourseUnitAttainmentRestricted } from '@/app/api/generated/OriApi';
import { makeCourse, makePeriod } from './__fixtures__/timeline';
import { getCandidatePrerequisites } from './candidatePrerequisites';

const p2 = makePeriod({ locator: 'p2', name: '2. period', startDate: '2026-11-01', endDate: '2026-12-20' });
const p3 = makePeriod({ locator: 'p3', name: '3. period', startDate: '2027-01-01', endDate: '2027-03-01' });
const prereq = (groupId: string): PrerequisiteInfo => ({
  courseUnitId: 'cand',
  compulsory: [{ prerequisites: [{ courseUnitGroupId: groupId, name: 'Distributed Systems' }] }],
  recommended: [],
});
const candidate = makeCourse({ courseUnitId: 'cand', courseUnitGroupId: 'g-cand', plannedPeriods: [p3] });

describe('getCandidatePrerequisites', () => {
  test('missing prerequisite is unmet', () => {
    expect(
      getCandidatePrerequisites({ candidate, courses: [], prerequisites: prereq('g-ds'), attainments: [] }).unmet,
    ).toEqual(['Distributed Systems']);
  });

  test('planned earlier but not passed is a quiet note, not unmet', () => {
    const ds = makeCourse({
      courseUnitId: 'ds',
      courseUnitGroupId: 'g-ds',
      courseCode: 'CT30A3401',
      plannedPeriods: [p2],
    });
    expect(
      getCandidatePrerequisites({ candidate, courses: [ds], prerequisites: prereq('g-ds'), attainments: [] }),
    ).toEqual({ unmet: [], plannedOnly: [{ label: 'CT30A3401', periodName: '2. period' }] });
  });

  test('passed outside the plan counts as met with no note', () => {
    const attainment = {
      courseUnitGroupId: 'g-ds',
      state: 'ATTAINED',
      primary: true,
    } as unknown as CourseUnitAttainmentRestricted;
    expect(
      getCandidatePrerequisites({ candidate, courses: [], prerequisites: prereq('g-ds'), attainments: [attainment] }),
    ).toEqual({ unmet: [], plannedOnly: [] });
  });

  test('no prerequisite info, nothing to say', () => {
    expect(getCandidatePrerequisites({ candidate, courses: [], prerequisites: undefined, attainments: [] })).toEqual({
      unmet: [],
      plannedOnly: [],
    });
  });
});
