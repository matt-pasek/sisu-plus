import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  findCachedPlan,
  restorePlans,
  snapshotPlans,
  updateCachedPlan,
  type PlansSnapshot,
} from '@/app/api/dataPoints/planCache';
import { updatePlan } from '@/app/api/endpoints/updatePlan';
import type { CourseUnitSelection, Plan } from '@/app/api/generated/OsuvaApi';

export interface AddCourseArgs {
  courseUnitId: string;
  parentModuleId: string;
  plannedPeriodLocators?: string[];
  planId: string;
}

interface AddCourseContext {
  snapshot: PlansSnapshot;
}

function addCourseSelection(plan: Plan, args: AddCourseArgs): Plan {
  const existingSelection = plan.courseUnitSelections.find((selection) => selection.courseUnitId === args.courseUnitId);
  if (existingSelection) return plan;

  const newSelection: CourseUnitSelection = {
    courseUnitId: args.courseUnitId,
    parentModuleId: args.parentModuleId,
    plannedPeriods: args.plannedPeriodLocators ?? [],
  };

  return {
    ...plan,
    courseUnitSelections: [...plan.courseUnitSelections, newSelection],
  };
}

export function useAddCourseToPlan() {
  const queryClient = useQueryClient();

  return useMutation<Plan, Error, AddCourseArgs, AddCourseContext>({
    mutationFn: async (args) => {
      const plan = findCachedPlan(queryClient, args.planId);
      if (!plan) throw new Error('Plan not found.');

      return updatePlan(args.planId, addCourseSelection(plan, args));
    },
    onMutate: async (args) => {
      await queryClient.cancelQueries({ queryKey: ['plans'] });
      await queryClient.cancelQueries({ queryKey: ['timeline-courses', args.planId] });

      const snapshot = snapshotPlans(queryClient);
      updateCachedPlan(queryClient, args.planId, (plan) => addCourseSelection(plan, args));

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
