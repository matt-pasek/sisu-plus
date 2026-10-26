import { useMemo } from 'react';
import type { StudyPeriodInfo, StudyPeriodMap } from '@/app/api/dataPoints/getStudyPeriodMap';
import type { TimelineCourse } from '@/app/api/dataPoints/getTimelineCourses';
import { useCourseTeaching } from '@/app/api/dataPoints/getCourseTeaching';
import type { FreeSearchModule } from '@/app/api/dataPoints/planOptions/walkPlanOptions';
import type { CourseUnitAttainmentRestricted } from '@/app/api/generated/OriApi';
import type { Plan } from '@/app/api/generated/OsuvaApi';
import { buildPeriodSuggestions, type SuggestionGroup } from '@/app/views/timeline/util/periodSuggestions';
import {
  buildPrerequisitesById,
  countUncheckedCourses,
  getPendingIds,
  isSuggestionLoadFailed,
} from '@/app/views/timeline/util/suggestionDerivation';
import { useRemainingOptions } from './useRemainingOptions';

interface Args {
  plan: Plan | undefined;
  enabled: boolean;
  targetLocator: string | null;
  courses: TimelineCourse[];
  studyPeriodMap: StudyPeriodMap;
  attainments: CourseUnitAttainmentRestricted[];
  keepVisibleId?: string | null;
}

const EMPTY_GROUPS: SuggestionGroup[] = [];
const NO_SEARCH_MODULES: FreeSearchModule[] = [];

export const usePeriodSuggestions = ({
  plan,
  enabled,
  targetLocator,
  courses,
  studyPeriodMap,
  attainments,
  keepVisibleId = null,
}: Args) => {
  const active = enabled && targetLocator != null;
  const { optionsQuery, optionGroups, planCourseUnitIds, planGroupIds, remainingIds } = useRemainingOptions({
    plan,
    enabled: active,
    courses,
    attainments,
    keepVisibleId,
  });
  const { data: options, isLoading: optionsLoading, isError: optionsError } = optionsQuery;

  const periods = useMemo<StudyPeriodInfo[]>(
    () => [...studyPeriodMap.values()].sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [studyPeriodMap],
  );

  const { byId, isLoading: teachingLoading, failedIds } = useCourseTeaching(remainingIds, active);

  const groups = useMemo(() => {
    if (!options || !targetLocator) return EMPTY_GROUPS;
    const teaching = new Map([...byId].map(([id, entry]) => [id, entry.realisations] as const));
    return buildPeriodSuggestions({
      groups: options.groups,
      planGroupIds,
      teaching,
      periods,
      targetLocator,
      keepVisibleId,
      skipIds: failedIds,
      pendingIds: getPendingIds(remainingIds, new Set(byId.keys()), failedIds),
    });
  }, [byId, failedIds, keepVisibleId, options, periods, planGroupIds, remainingIds, targetLocator]);

  const prerequisitesById = useMemo(
    () =>
      buildPrerequisitesById({
        groups,
        prerequisites: new Map([...byId].map(([id, entry]) => [id, entry.prerequisites] as const)),
        courses,
        attainments,
        studyPeriodMap,
      }),
    [attainments, byId, courses, groups, studyPeriodMap],
  );

  const uncheckedCount = useMemo(
    () => countUncheckedCourses({ groups: optionGroups, planGroupIds, keepVisibleId, failedIds }),
    [failedIds, keepVisibleId, optionGroups, planGroupIds],
  );

  return {
    groups,
    optionGroups,
    prerequisitesById,
    freeSearchModules: options?.freeSearchModules ?? NO_SEARCH_MODULES,
    planCourseUnitIds,
    planGroupIds,
    periods,
    uncheckedCount,
    loadFailed:
      active &&
      isSuggestionLoadFailed({
        optionsFailed: Boolean(optionsError && !options),
        teachingLoading,
        uncheckedCount,
        remainingCount: remainingIds.length,
      }),
    isLoading: active && optionsLoading,
  };
};
