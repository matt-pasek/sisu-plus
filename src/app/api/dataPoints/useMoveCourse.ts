import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  PLAN_WRITE_SCOPE,
  findCachedPlan,
  restorePlans,
  snapshotPlans,
  updateCachedPlan,
  type PlansSnapshot,
} from '@/app/api/dataPoints/planCache';
import { updatePlan } from '@/app/api/endpoints/updatePlan';
import type { Plan } from '@/app/api/generated/OsuvaApi';

export interface MoveCourseArgs {
  courseUnitId: string;
  newPeriodLocators: string[];
  planId: string;
}

interface MoveCourseContext {
  snapshot: PlansSnapshot;
}

function updateCoursePeriods(plan: Plan, courseUnitId: string, newPeriodLocators: string[]): Plan {
  return {
    ...plan,
    courseUnitSelections: plan.courseUnitSelections.map((selection) =>
      selection.courseUnitId === courseUnitId ? { ...selection, plannedPeriods: newPeriodLocators } : selection,
    ),
  };
}

export function useMoveCourse() {
  const queryClient = useQueryClient();

  return useMutation<Plan, Error, MoveCourseArgs, MoveCourseContext>({
    scope: PLAN_WRITE_SCOPE,
    mutationFn: async ({ courseUnitId, newPeriodLocators, planId }) => {
      const plan = findCachedPlan(queryClient, planId);
      if (!plan) throw new Error('Plan not found.');

      return updatePlan(planId, updateCoursePeriods(plan, courseUnitId, newPeriodLocators));
    },
    onMutate: async ({ courseUnitId, newPeriodLocators, planId }) => {
      await queryClient.cancelQueries({ queryKey: ['plans'] });
      await queryClient.cancelQueries({ queryKey: ['timeline-courses', planId] });

      const snapshot = snapshotPlans(queryClient);
      updateCachedPlan(queryClient, planId, (plan) => updateCoursePeriods(plan, courseUnitId, newPeriodLocators));

      return { snapshot };
    },
    onError: (_error, _args, context) => {
      if (context) restorePlans(queryClient, context.snapshot);
    },
    onSettled: async (_data, _error, args) => {
      await queryClient.invalidateQueries({ queryKey: ['plans'] });
      await queryClient.invalidateQueries({ queryKey: ['timeline-courses', args?.planId] });
    },
  });
}
