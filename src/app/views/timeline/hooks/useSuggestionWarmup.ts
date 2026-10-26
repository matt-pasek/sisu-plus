import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { courseTeachingQuery } from '@/app/api/dataPoints/getCourseTeaching';
import type { TimelineCourse } from '@/app/api/dataPoints/getTimelineCourses';
import type { CourseUnitAttainmentRestricted } from '@/app/api/generated/OriApi';
import type { Plan } from '@/app/api/generated/OsuvaApi';
import { useRemainingOptions } from './useRemainingOptions';

interface Args {
  plan: Plan | undefined;
  enabled: boolean;
  courses: TimelineCourse[];
  attainments: CourseUnitAttainmentRestricted[];
}

const IDLE_TIMEOUT_MS = 5_000;

export const useSuggestionWarmup = ({ plan, enabled, courses, attainments }: Args) => {
  const queryClient = useQueryClient();
  const { i18n } = useTranslation();
  const { remainingIds } = useRemainingOptions({ plan, enabled, courses, attainments });
  const idsKey = remainingIds.join(',');

  useEffect(() => {
    if (!enabled || !idsKey) return;
    const handle = requestIdleCallback(
      () => idsKey.split(',').forEach((id) => void queryClient.prefetchQuery(courseTeachingQuery(id, i18n.language))),
      { timeout: IDLE_TIMEOUT_MS },
    );
    return () => cancelIdleCallback(handle);
  }, [enabled, i18n.language, idsKey, queryClient]);
};
