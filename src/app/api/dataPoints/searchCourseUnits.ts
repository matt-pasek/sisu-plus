import { koriApi } from '@/app/api/client';
import { pickLabel } from '@/app/api/resolvers/helpers/pickLabel';
import { getCurrentLocale } from '@/app/i18n';
import { useSisuQuery } from '@/app/hooks/useSisuQuery';
import { buildCourseSearchQuery, type CourseSearchScope } from './courseSearchQuery';
import { getHomeUniversityOrgId } from './getHomeUniversityOrgId';

export type CourseUnitSearchResult = {
  courseUnitId: string;
  groupId: string | null;
  code: string | null;
  name: string;
  credits: number | null;
  creditsMax: number | null;
  universityOrgId: string | null;
};

/** 'home' matches Sisu's first result group; 'network' is its cross-institutional studies offering. */
export function searchCourseUnits(
  query: string,
  scope: CourseSearchScope = 'home',
): {
  data: CourseUnitSearchResult[] | undefined;
  isLoading: boolean;
} {
  const { orgId } = getHomeUniversityOrgId();

  return useSisuQuery(
    ['course-unit-search', scope, orgId, query],
    async () => {
      const response = await koriApi.api.searchCourseUnits(
        buildCourseSearchQuery({ scope, orgId: orgId!, query, uiLang: getCurrentLocale() }),
      );

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
          universityOrgId: course.universityOrgIds?.[0] ?? null,
        }));
    },
    { enabled: orgId != null && query.trim().length >= 3 },
  );
}
