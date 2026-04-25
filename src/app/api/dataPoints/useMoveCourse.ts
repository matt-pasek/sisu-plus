import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePlan } from '@/app/api/endpoints/updatePlan';
import type { Plan } from '@/app/api/generated/OsuvaApi';

export interface MoveCourseArgs {
  courseUnitId: string;
  newPeriodLocators: string[];
  planId: string;
}

interface MoveCourseContext {
  previousPlans: Plan[] | undefined;
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
    mutationFn: async ({ courseUnitId, newPeriodLocators, planId }) => {
      const plans = queryClient.getQueryData<Plan[]>(['plans']);
      const plan = plans?.find((candidate) => candidate.id === planId);
      if (!plan) throw new Error('Plan not found.');

      return updatePlan(planId, updateCoursePeriods(plan, courseUnitId, newPeriodLocators));
    },
    onMutate: async ({ courseUnitId, newPeriodLocators, planId }) => {
      await queryClient.cancelQueries({ queryKey: ['plans'] });
      await queryClient.cancelQueries({ queryKey: ['timeline-courses', planId] });

      const previousPlans = queryClient.getQueryData<Plan[]>(['plans']);
      queryClient.setQueryData<Plan[]>(['plans'], (plans) =>
        plans?.map((plan) => (plan.id === planId ? updateCoursePeriods(plan, courseUnitId, newPeriodLocators) : plan)),
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
