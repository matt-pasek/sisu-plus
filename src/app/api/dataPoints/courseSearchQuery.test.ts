/// <reference types="bun-types" />
import { describe, expect, test } from 'bun:test';
import { buildCourseSearchQuery } from './courseSearchQuery';

describe('buildCourseSearchQuery', () => {
  const base = { orgId: 'lut-university-root-id', query: 'game', uiLang: 'en' };

  test('the home scope searches only the home university', () => {
    const query = buildCourseSearchQuery({ ...base, scope: 'home' });
    expect(query.universityOrgId).toEqual(['lut-university-root-id']);
    expect(query.cooperationNetworkSearchType).toBeUndefined();
    expect(query.fullTextQuery).toBe('game');
  });

  test('the network scope searches courses shared with the home university, excluding its own', () => {
    const query = buildCourseSearchQuery({ ...base, scope: 'network' });
    expect(query.universityOrgId).toBeUndefined();
    expect(query.excludeUniversityOrgId).toEqual(['lut-university-root-id']);
    expect(query.cooperationNetworkSearchType).toBe('COURSE_UNITS');
    expect(query.cooperationNetworkIdsForUniversityOrgId).toEqual(['lut-university-root-id']);
  });

  test('both scopes keep current and future degree studies only', () => {
    for (const scope of ['home', 'network'] as const) {
      const query = buildCourseSearchQuery({ ...base, scope });
      expect(query.validity).toBe('ONGOING_AND_FUTURE');
      expect(query.studyType).toBe('DEGREE_STUDIES');
      expect(query.limit).toBe(8);
    }
  });
});
