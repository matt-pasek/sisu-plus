import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { createLimiter } from '@/app/api/dataPoints/util/concurrency';
import { resolveCourseRealisations } from '@/app/api/resolvers/resolveCourseRealisations';
import { resolveCourseUnit } from '@/app/api/resolvers/resolveCourseUnit';
import { resolvePrerequisites, type PrerequisiteInfo } from '@/app/api/resolvers/resolvePrerequisites';
import type { RealisationResult } from '@/app/api/resolvers/resolveRealization';

export interface CourseTeaching {
  courseUnitGroupId: string | null;
  realisations: RealisationResult[];
  prerequisites: PrerequisiteInfo;
}

const limit = createLimiter(6);

export const fetchCourseTeaching = (courseUnitId: string): Promise<CourseTeaching> =>
  limit(async () => {
    const unit = await resolveCourseUnit(courseUnitId);
    const [realisations, prerequisites] = await Promise.all([
      resolveCourseRealisations(unit.assessmentItemIds),
      resolvePrerequisites(courseUnitId),
    ]);
    return { courseUnitGroupId: unit.groupId, realisations, prerequisites };
  });

export const useCourseTeaching = (courseUnitIds: string[], enabled: boolean) => {
  const { i18n } = useTranslation();

  const results = useQueries({
    queries: courseUnitIds.map((id) => ({
      queryKey: ['course-teaching', id, i18n.language],
      queryFn: () => fetchCourseTeaching(id),
      enabled,
      staleTime: 30 * 60_000,
      retry: 1,
    })),
  });

  const dataKey = results.map((result) => result.dataUpdatedAt).join(',');
  const isLoading = results.some((result) => result.isLoading);

  const byId = useMemo(() => {
    const map = new Map<string, CourseTeaching>();
    courseUnitIds.forEach((id, index) => {
      const data = results[index]?.data;
      if (data) map.set(id, data);
    });
    return map;
    // The joined id key is deliberate: a new array with the same ids must not rebuild byId.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseUnitIds.join(','), dataKey]);

  const failedKey = courseUnitIds.filter((_, index) => results[index]?.isError && !results[index]?.data).join(',');
  const failedIds = useMemo(() => new Set(failedKey ? failedKey.split(',') : []), [failedKey]);

  return { byId, isLoading, failedIds };
};
