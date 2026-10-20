import { useMemo } from 'react';
import type { StudyPeriodInfo, StudyPeriodMap } from '@/app/api/dataPoints/getStudyPeriodMap';
import { getPlanOptions } from '@/app/api/dataPoints/getPlanOptions';
import type { TimelineCourse } from '@/app/api/dataPoints/getTimelineCourses';
import { useCourseTeaching } from '@/app/api/dataPoints/getCourseTeaching';
import type { PlanOptionGroup } from '@/app/api/dataPoints/planOptions/buildOptionGroups';
import type { FreeSearchModule } from '@/app/api/dataPoints/planOptions/walkPlanOptions';
import type { CourseUnitAttainmentRestricted } from '@/app/api/generated/OriApi';
import type { Plan } from '@/app/api/generated/OsuvaApi';
import { buildPeriodSuggestions, type SuggestionGroup } from '@/app/views/timeline/util/periodSuggestions';
import {
  buildPrerequisitesById,
  countUncheckedCourses,
  getPlanGroupIds,
  getRemainingOptionIds,
} from '@/app/views/timeline/util/suggestionDerivation';
import { getPassedCourseUnitGroupIds } from '@/app/views/timeline/util/timelineValidation';

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
const NO_OPTION_GROUPS: PlanOptionGroup[] = [];
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
  const { data: options, isLoading: optionsLoading, isError: optionsError } = getPlanOptions(plan, active);
  const optionGroups = options?.groups ?? NO_OPTION_GROUPS;

  const planCourseUnitIds = useMemo(
    () => new Set((plan?.courseUnitSelections ?? []).map((selection) => selection.courseUnitId)),
    [plan],
  );

  const planGroupIds = useMemo(
    () =>
      getPlanGroupIds({
        courses,
        passedGroupIds: getPassedCourseUnitGroupIds(attainments),
        selectedCourseUnitIds: planCourseUnitIds,
        groups: optionGroups,
      }),
    [attainments, courses, optionGroups, planCourseUnitIds],
  );

  const periods = useMemo<StudyPeriodInfo[]>(
    () => [...studyPeriodMap.values()].sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [studyPeriodMap],
  );

  const remainingIds = useMemo(
    () => getRemainingOptionIds({ groups: optionGroups, planGroupIds, keepVisibleId }),
    [keepVisibleId, optionGroups, planGroupIds],
  );

  const { byId, isLoading: teachingLoading, failedIds } = useCourseTeaching(remainingIds, active);

  const groups = useMemo(() => {
    if (!options || !targetLocator || teachingLoading) return EMPTY_GROUPS;
    const teaching = new Map([...byId].map(([id, entry]) => [id, entry.realisations] as const));
    return buildPeriodSuggestions({
      groups: options.groups,
      planGroupIds,
      teaching,
      periods,
      targetLocator,
      keepVisibleId,
      skipIds: failedIds,
    });
  }, [byId, failedIds, keepVisibleId, options, periods, planGroupIds, targetLocator, teachingLoading]);

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
      active && ((optionsError && !options) || (!teachingLoading && uncheckedCount > 0 && groups.length === 0)),
    isLoading: active && (optionsLoading || teachingLoading),
  };
};
