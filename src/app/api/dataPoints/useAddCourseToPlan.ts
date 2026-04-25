import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePlan } from '@/app/api/endpoints/updatePlan';
import type { CourseUnitSelection, Plan } from '@/app/api/generated/OsuvaApi';

export interface AddCourseArgs {
  courseUnitId: string;
  parentModuleId: string;
  plannedPeriodLocators?: string[];
  planId: string;
}

interface AddCourseContext {
  previousPlans: Plan[] | undefined;
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
      const plans = queryClient.getQueryData<Plan[]>(['plans']);
      const plan = plans?.find((candidate) => candidate.id === args.planId);
      if (!plan) throw new Error('Plan not found.');

      return updatePlan(args.planId, addCourseSelection(plan, args));
    },
    onMutate: async (args) => {
      await queryClient.cancelQueries({ queryKey: ['plans'] });
      await queryClient.cancelQueries({ queryKey: ['timeline-courses', args.planId] });

      const previousPlans = queryClient.getQueryData<Plan[]>(['plans']);
      queryClient.setQueryData<Plan[]>(['plans'], (plans) =>
        plans?.map((plan) => (plan.id === args.planId ? addCourseSelection(plan, args) : plan)),
      );

      return { previousPlans };
    },
    onError: (_error, _args, context) => {
      queryClient.setQueryData(['plans'], context?.previousPlans);
    },
    onSettled: async (_data, _error, args) => {
      await queryClient.invalidateQueries({ queryKey: ['plans'] });
      await queryClient.invalidateQueries({ queryKey: ['timeline-courses', args?.planId] });
    },
  });
}
