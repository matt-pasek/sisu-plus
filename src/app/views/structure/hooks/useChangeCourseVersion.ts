import { useQueryClient } from '@tanstack/react-query';
import { findCachedPlan } from '@/app/api/dataPoints/planCache';
import type { Plan } from '@/app/api/generated/OsuvaApi';
import { useStructurePlanMutation } from './useStructurePlanMutation';

type ChangeCourseVersionArgs = {
  planId: string;
  oldCourseUnitId: string;
  newCourseUnitId: string;
};

export const swapCourseVersion = (plan: Plan, oldCourseUnitId: string, newCourseUnitId: string) => {
  return {
    ...plan,
    courseUnitSelections: plan.courseUnitSelections.map((selection) =>
      selection.courseUnitId === oldCourseUnitId
        ? { ...selection, courseUnitId: newCourseUnitId, completionMethodId: undefined }
        : selection,
    ),
    assessmentItemSelections: plan.assessmentItemSelections.filter(
      (selection) => selection.courseUnitId !== oldCourseUnitId,
    ),
  };
};

export const useChangeCourseVersion = ({ planId, oldCourseUnitId, newCourseUnitId }: ChangeCourseVersionArgs) => {
  const queryClient = useQueryClient();
  const saveStructurePlan = useStructurePlanMutation();

  const buildNextPlan = () => {
    const plan = findCachedPlan(queryClient, planId);
    if (!plan) throw new Error('Study plan missing from cache.');
    return swapCourseVersion(plan, oldCourseUnitId, newCourseUnitId);
  };

  return {
    ...saveStructurePlan,
    changeVersion: (options?: Parameters<typeof saveStructurePlan.mutate>[1]) => {
      saveStructurePlan.mutate(buildNextPlan(), options);
    },
    changeVersionAsync: (options?: Parameters<typeof saveStructurePlan.mutateAsync>[1]) =>
      saveStructurePlan.mutateAsync(buildNextPlan(), options),
  };
};
