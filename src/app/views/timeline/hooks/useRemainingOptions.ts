import { useMemo } from 'react';
import { getPlanOptions } from '@/app/api/dataPoints/getPlanOptions';
import type { TimelineCourse } from '@/app/api/dataPoints/getTimelineCourses';
import type { PlanOptionGroup } from '@/app/api/dataPoints/planOptions/buildOptionGroups';
import type { CourseUnitAttainmentRestricted } from '@/app/api/generated/OriApi';
import type { Plan } from '@/app/api/generated/OsuvaApi';
import { getPlanGroupIds, getRemainingOptionIds } from '@/app/views/timeline/util/suggestionDerivation';
import { getPassedCourseUnitGroupIds } from '@/app/views/timeline/util/timelineValidation';

interface Args {
  plan: Plan | undefined;
  enabled: boolean;
  courses: TimelineCourse[];
  attainments: CourseUnitAttainmentRestricted[];
  keepVisibleId?: string | null;
}

const NO_OPTION_GROUPS: PlanOptionGroup[] = [];

export const useRemainingOptions = ({ plan, enabled, courses, attainments, keepVisibleId = null }: Args) => {
  const optionsQuery = getPlanOptions(plan, enabled);
  const optionGroups = optionsQuery.data?.groups ?? NO_OPTION_GROUPS;

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

  const remainingIds = useMemo(
    () => getRemainingOptionIds({ groups: optionGroups, planGroupIds, keepVisibleId }),
    [keepVisibleId, optionGroups, planGroupIds],
  );

  return { optionsQuery, optionGroups, planCourseUnitIds, planGroupIds, remainingIds };
};
