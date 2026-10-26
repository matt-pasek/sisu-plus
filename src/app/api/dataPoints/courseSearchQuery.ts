import type { KoriApi } from '@/app/api/generated/KoriApi';

export type CourseSearchScope = 'home' | 'network';

type CourseSearchQuery = NonNullable<Parameters<KoriApi<unknown>['api']['searchCourseUnits']>[0]>;

interface CourseSearchArgs {
  scope: CourseSearchScope;
  orgId: string;
  query: string;
  uiLang: string;
}

const RESULT_LIMIT = 8;

export const buildCourseSearchQuery = ({ scope, orgId, query, uiLang }: CourseSearchArgs): CourseSearchQuery => {
  const shared: CourseSearchQuery = {
    fullTextQuery: query,
    uiLang,
    limit: RESULT_LIMIT,
    validity: 'ONGOING_AND_FUTURE',
    studyType: 'DEGREE_STUDIES',
  };
  if (scope === 'home') return { ...shared, universityOrgId: [orgId] };
  return {
    ...shared,
    excludeUniversityOrgId: [orgId],
    cooperationNetworkSearchType: 'COURSE_UNITS',
    cooperationNetworkIdsForUniversityOrgId: [orgId],
  };
};
