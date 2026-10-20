import { koriApi } from '@/app/api/client';
import { pickLabel } from '@/app/api/resolvers/helpers/pickLabel';
import { getCurrentLocale } from '@/app/i18n';
import { useSisuQuery } from '@/app/hooks/useSisuQuery';
import { getHomeUniversityOrgId } from './getHomeUniversityOrgId';

export type CourseUnitSearchResult = {
  courseUnitId: string;
  groupId: string | null;
  code: string | null;
  name: string;
  credits: number | null;
  creditsMax: number | null;
};

/** Searches the student's own university, like Sisu's first result group; cross-institutional offering is separate. */
export function searchCourseUnits(query: string): {
  data: CourseUnitSearchResult[] | undefined;
  isLoading: boolean;
} {
  const { orgId } = getHomeUniversityOrgId();

  return useSisuQuery(
    ['course-unit-search', orgId, query],
    async () => {
      const response = await koriApi.api.searchCourseUnits({
        universityOrgId: [orgId!],
        fullTextQuery: query,
        uiLang: getCurrentLocale(),
        limit: 8,
        validity: 'ONGOING_AND_FUTURE',
        studyType: 'DEGREE_STUDIES',
      });

      return (response.data.searchResults ?? [])
        .filter((course) => course.id != null)
        .map((course) => ({
          courseUnitId: course.id!,
          groupId: course.groupId ?? null,
          code: course.code ?? null,
          name:
            course.name ??
            (course.nameMatch ? pickLabel({ [getCurrentLocale()]: course.nameMatch }) : null) ??
            course.code ??
            course.id!,
          credits: course.credits?.min ?? null,
          creditsMax: course.credits?.max ?? null,
        }));
    },
    { enabled: orgId != null && query.trim().length >= 3 },
  );
}
