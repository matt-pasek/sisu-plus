import { useCallback, useEffect, useMemo, useState } from 'react';
import type { StudyPeriodMap } from '@/app/api/dataPoints/getStudyPeriodMap';
import type { TimelineCourse } from '@/app/api/dataPoints/getTimelineCourses';
import { applyDraftToCourses, getCourseLocators, stageDraft } from '@/app/views/timeline/util';

export interface TimelineDraft {
  draftPeriodsByCourseId: Map<string, string[]>;
  draftTimelineCourses: TimelineCourse[];
  draftCourseIds: Set<string>;
  draftOriginalPeriodCounts: Map<string, number>;
  stageCoursePeriods: (courseUnitId: string, locators: string[]) => void;
  resetDraft: () => void;
}

export const useTimelineDraft = (
  timelineCourses: TimelineCourse[],
  studyPeriodMap: StudyPeriodMap,
  planId: string | undefined,
): TimelineDraft => {
  const [draftPeriodsByCourseId, setDraftPeriodsByCourseId] = useState<Map<string, string[]>>(new Map());

  const draftTimelineCourses = useMemo(
    () => applyDraftToCourses(timelineCourses, draftPeriodsByCourseId, studyPeriodMap),
    [draftPeriodsByCourseId, studyPeriodMap, timelineCourses],
  );
  const draftCourseIds = useMemo(() => new Set(draftPeriodsByCourseId.keys()), [draftPeriodsByCourseId]);
  const draftOriginalPeriodCounts = useMemo(
    () =>
      new Map(
        timelineCourses
          .filter((course) => draftPeriodsByCourseId.has(course.courseUnitId) && course.plannedPeriods.length > 0)
          .map((course) => [course.courseUnitId, course.plannedPeriods.length] as const),
      ),
    [draftPeriodsByCourseId, timelineCourses],
  );

  const stageCoursePeriods = useCallback(
    (courseUnitId: string, locators: string[]) => {
      const course = timelineCourses.find((candidate) => candidate.courseUnitId === courseUnitId);
      if (!course) return;

      const originalLocators = getCourseLocators(course);
      setDraftPeriodsByCourseId((current) => stageDraft(current, originalLocators, courseUnitId, locators));
    },
    [timelineCourses],
  );

  const resetDraft = useCallback(() => setDraftPeriodsByCourseId(new Map()), []);

  useEffect(() => {
    resetDraft();
  }, [planId, resetDraft]);

  return {
    draftPeriodsByCourseId,
    draftTimelineCourses,
    draftCourseIds,
    draftOriginalPeriodCounts,
    stageCoursePeriods,
    resetDraft,
  };
};
