import type { StudyPeriodMap } from '@/app/api/dataPoints/getStudyPeriodMap';
import type { TimelineCourse } from '@/app/api/dataPoints/getTimelineCourses';
import type { PlanOptionGroup } from '@/app/api/dataPoints/planOptions/buildOptionGroups';
import type { PrerequisiteInfo } from '@/app/api/resolvers/resolvePrerequisites';
import type { CourseUnitAttainmentRestricted } from '@/app/api/generated/OriApi';
import { toCandidateCourse } from './candidateCourse';
import { getCandidatePrerequisites, type CandidatePrerequisites } from './candidatePrerequisites';
import { isGroupVisible, isOptionPlanned, type SuggestionGroup } from './periodSuggestions';

interface PlanGroupIdsArgs {
  courses: Pick<TimelineCourse, 'courseUnitGroupId'>[];
  passedGroupIds: Set<string>;
  selectedCourseUnitIds: Set<string>;
  groups: PlanOptionGroup[];
}

export const getPlanGroupIds = ({
  courses,
  passedGroupIds,
  selectedCourseUnitIds,
  groups,
}: PlanGroupIdsArgs): Set<string> =>
  new Set([
    ...courses.flatMap((course) => (course.courseUnitGroupId ? [course.courseUnitGroupId] : [])),
    ...passedGroupIds,
    ...groups.flatMap((group) =>
      group.options
        .filter((option) => selectedCourseUnitIds.has(option.courseUnitId))
        .map((option) => option.courseUnitGroupId),
    ),
  ]);

interface RemainingIdsArgs {
  groups: PlanOptionGroup[];
  planGroupIds: Set<string>;
  keepVisibleId: string | null;
}

export const getRemainingOptionIds = ({ groups, planGroupIds, keepVisibleId }: RemainingIdsArgs): string[] => {
  const ids = groups
    .filter((group) => isGroupVisible(group, planGroupIds, keepVisibleId))
    .flatMap((group) =>
      group.options
        .filter((option) => !isOptionPlanned(option, planGroupIds) || option.courseUnitId === keepVisibleId)
        .map((option) => option.courseUnitId),
    );
  return [...new Set(ids)];
};

interface PrerequisitesArgs {
  groups: SuggestionGroup[];
  prerequisites: Map<string, PrerequisiteInfo>;
  courses: TimelineCourse[];
  attainments: CourseUnitAttainmentRestricted[];
  studyPeriodMap: StudyPeriodMap;
}

export const buildPrerequisitesById = ({
  groups,
  prerequisites,
  courses,
  attainments,
  studyPeriodMap,
}: PrerequisitesArgs): Map<string, CandidatePrerequisites> => {
  const result = new Map<string, CandidatePrerequisites>();
  for (const { group, taught } of groups) {
    for (const { option, fit } of taught) {
      if (!fit || result.has(option.courseUnitId)) continue;
      const candidate = toCandidateCourse({
        option,
        sectionId: group.sectionId,
        sectionName: group.sectionName,
        parentModuleId: group.moduleId,
        plannedPeriods: fit.periodLocators.flatMap((locator) => studyPeriodMap.get(locator) ?? []),
      });
      result.set(
        option.courseUnitId,
        getCandidatePrerequisites({
          candidate,
          courses: courses.filter((course) => course.courseUnitId !== option.courseUnitId),
          prerequisites: prerequisites.get(option.courseUnitId),
          attainments,
        }),
      );
    }
  }
  return result;
};

export const countUncheckedCourses = (args: RemainingIdsArgs & { failedIds: Set<string> }): number =>
  getRemainingOptionIds(args).filter((id) => args.failedIds.has(id)).length;

interface SuggestionLoadState {
  optionsFailed: boolean;
  teachingLoading: boolean;
  uncheckedCount: number;
  remainingCount: number;
}

export const isSuggestionLoadFailed = (state: SuggestionLoadState): boolean =>
  state.optionsFailed ||
  (!state.teachingLoading && state.remainingCount > 0 && state.uncheckedCount === state.remainingCount);

export const formatCreditAmount = (credits: number): string => String(Math.round(credits * 100) / 100);

export const getPendingIds = (remainingIds: string[], loadedIds: Set<string>, failedIds: Set<string>): Set<string> =>
  new Set(remainingIds.filter((id) => !loadedIds.has(id) && !failedIds.has(id)));
