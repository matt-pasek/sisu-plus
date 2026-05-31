import { koriApi } from '@/app/api/client';
import { pickLabel } from '@/app/api/resolvers/helpers/pickLabel';
import { getCurrentLocale } from '@/app/i18n';
import { useSisuQuery } from '@/app/hooks/useSisuQuery';

export type CourseUnitSearchResult = {
  courseUnitId: string;
  groupId: string | null;
  code: string | null;
  name: string;
  credits: number | null;
};

export function searchCourseUnits(query: string): {
  data: CourseUnitSearchResult[] | undefined;
  isLoading: boolean;
} {
  return useSisuQuery(
    ['course-unit-search', query],
    async () => {
      const response = await koriApi.api.searchCourseUnits({
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
        }));
    },
    { enabled: query.trim().length >= 3 },
  );
}
