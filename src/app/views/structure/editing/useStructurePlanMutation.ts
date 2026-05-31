import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePlan } from '@/app/api/endpoints/updatePlan';
import type { Plan } from '@/app/api/generated/OsuvaApi';

type StructurePlanContext = {
  previousPlans: Plan[] | undefined;
};

export function useStructurePlanMutation() {
  const queryClient = useQueryClient();

  return useMutation<Plan, Error, Plan, StructurePlanContext>({
    mutationFn: async (plan) => {
      if (!plan.id) throw new Error('Plan id missing.');
      return updatePlan(plan.id, plan);
    },
    onMutate: async (plan) => {
      await queryClient.cancelQueries({ queryKey: ['plans'] });
      await queryClient.cancelQueries({ queryKey: ['structure-data'] });

      const previousPlans = queryClient.getQueryData<Plan[]>(['plans']);
      queryClient.setQueryData<Plan[]>(['plans'], (plans) =>
        plans?.map((candidate) => (candidate.id === plan.id ? plan : candidate)),
      );

      return { previousPlans };
    },
    onError: (_error, _plan, context) => {
      queryClient.setQueryData(['plans'], context?.previousPlans);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['plans'] });
      await queryClient.invalidateQueries({ queryKey: ['structure-data'] });
      await queryClient.invalidateQueries({ queryKey: ['timeline-courses'] });
    },
  });
}
