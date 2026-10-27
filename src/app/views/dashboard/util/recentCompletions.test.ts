/// <reference types="bun-types" />
import { describe, expect, test } from 'bun:test';
import type { Attainment } from '@/app/api/endpoints/attainments';
import { getRecentCompletions } from './recentCompletions';

const base = { primary: true, state: 'ATTAINED', credits: 3, gradeScaleId: 'sis-0-5', gradeId: 5 };
const course = (id: string, groupId: string, date: string) =>
  ({
    ...base,
    id,
    type: 'CourseUnitAttainment',
    courseUnitId: `cu-${id}`,
    courseUnitGroupId: groupId,
    attainmentDate: date,
  }) as unknown as Attainment;
const item = (id: string, groupId: string, date: string) =>
  ({
    ...base,
    id,
    type: 'AssessmentItemAttainment',
    courseUnitId: `cu-${id}`,
    courseUnitGroupId: groupId,
    assessmentItemId: `ai-${id}`,
    attainmentDate: date,
  }) as unknown as Attainment;

describe('getRecentCompletions', () => {
  test('adds an assessment item whose course has no course completion yet, marked as such', () => {
    const result = getRecentCompletions([
      course('testing', 'g-testing', '2026-07-30'),
      item('web', 'g-web', '2026-10-27'),
    ]);
    expect(result.map((entry) => [entry.attainment.id, entry.kind])).toEqual([
      ['web', 'assessmentItem'],
      ['testing', 'course'],
    ]);
  });

  test('drops the assessment item once its course, in any version, is completed', () => {
    const result = getRecentCompletions([
      item('web-exam', 'g-web', '2026-10-01'),
      course('web', 'g-web', '2026-10-27'),
    ]);
    expect(result.map((entry) => entry.attainment.id)).toEqual(['web']);
  });

  test('skips failed, non-primary and other attainment types', () => {
    const failed = { ...(course('a', 'g-a', '2026-10-01') as object), state: 'FAILED' } as unknown as Attainment;
    const secondary = { ...(item('b', 'g-b', '2026-10-02') as object), primary: false } as unknown as Attainment;
    const moduleAttainment = {
      ...base,
      id: 'm',
      type: 'ModuleAttainment',
      attainmentDate: '2026-10-03',
    } as unknown as Attainment;
    expect(getRecentCompletions([failed, secondary, moduleAttainment])).toEqual([]);
  });
});
