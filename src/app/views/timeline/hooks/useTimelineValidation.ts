import { useCallback, useEffect, useMemo, useState } from 'react';
import type { StudyPeriodMap } from '@/app/api/dataPoints/getStudyPeriodMap';
import type { TimelineCourse } from '@/app/api/dataPoints/getTimelineCourses';
import type { CourseUnitAttainmentRestricted } from '@/app/api/generated/OriApi';
import { resolvePrerequisites } from '@/app/api/resolvers/resolvePrerequisites';
import { useSisuQuery } from '@/app/hooks/useSisuQuery';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { type TimelineValidationWarning, getValidationWarnings } from '@/app/views/timeline/util';

interface UseTimelineValidationArgs {
  planId: string | undefined;
  timelineCourses: TimelineCourse[];
  draftTimelineCourses: TimelineCourse[];
  attainments: CourseUnitAttainmentRestricted[];
  studyPeriodMap: StudyPeriodMap;
}

export const useTimelineValidation = ({
  planId,
  timelineCourses,
  draftTimelineCourses,
  attainments,
  studyPeriodMap,
}: UseTimelineValidationArgs) => {
  const { t } = useTranslationWithPrefix('views.timeline');
  const [dismissedPrerequisiteWarningIds, setDismissedPrerequisiteWarningIds] = useState<Set<string>>(new Set());

  const prerequisiteQuery = useSisuQuery(
    ['timeline-prerequisites', planId],
    async () =>
      new Map(
        await Promise.all(
          timelineCourses.map(
            async (course) => [course.courseUnitId, await resolvePrerequisites(course.courseUnitId)] as const,
          ),
        ),
      ),
    { enabled: planId != null && timelineCourses.length > 0 },
  );

  const validationWarnings = useMemo(() => {
    const warnings = getValidationWarnings(draftTimelineCourses, prerequisiteQuery.data ?? new Map(), attainments);
    return new Map(
      [...warnings].map(([courseUnitId, courseWarnings]) => [
        courseUnitId,
        courseWarnings.map((warning) => {
          if (warning.type === 'period') {
            const periods = warning.id
              .split(':')
              .slice(2)
              .map((locator) => studyPeriodMap.get(locator)?.name ?? locator)
              .join(', ');
            return { ...warning, message: t('validation.missingPeriod', { periods }) };
          }
          return {
            ...warning,
            message: t('validation.prerequisite', { course: warning.message || t('validation.requiredCourse') }),
          };
        }),
      ]),
    );
  }, [attainments, draftTimelineCourses, prerequisiteQuery.data, studyPeriodMap, t]);

  const visibleValidationWarnings = useMemo(() => {
    const visibleWarnings = new Map<string, TimelineValidationWarning[]>();

    for (const [courseUnitId, warnings] of validationWarnings) {
      const filteredWarnings = warnings.filter(
        (warning) => warning.type !== 'prerequisite' || !dismissedPrerequisiteWarningIds.has(warning.id),
      );
      if (filteredWarnings.length > 0) visibleWarnings.set(courseUnitId, filteredWarnings);
    }

    return visibleWarnings;
  }, [dismissedPrerequisiteWarningIds, validationWarnings]);

  const validationIssueCount = useMemo(
    () => [...visibleValidationWarnings.values()].reduce((sum, warnings) => sum + warnings.length, 0),
    [visibleValidationWarnings],
  );

  const dismissWarning = useCallback(
    (warningId: string) => setDismissedPrerequisiteWarningIds((current) => new Set(current).add(warningId)),
    [],
  );
  const resetDismissed = useCallback(() => setDismissedPrerequisiteWarningIds(new Set()), []);

  useEffect(() => {
    resetDismissed();
  }, [planId, resetDismissed]);

  return {
    visibleValidationWarnings,
    validationIssueCount,
    prerequisitesLoading: prerequisiteQuery.isLoading,
    dismissWarning,
    resetDismissed,
  };
};
