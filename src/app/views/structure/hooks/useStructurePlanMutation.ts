import { useMutation, useQueryClient } from '@tanstack/react-query';
import { restorePlans, snapshotPlans, updateCachedPlan, type PlansSnapshot } from '@/app/api/dataPoints/planCache';
import { updatePlan } from '@/app/api/endpoints/updatePlan';
import type { Plan } from '@/app/api/generated/OsuvaApi';

type StructurePlanContext = {
  snapshot: PlansSnapshot;
};

export const useStructurePlanMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Plan, Error, Plan, StructurePlanContext>({
    mutationFn: async (plan) => {
      if (!plan.id) throw new Error('Plan id missing.');
      return updatePlan(plan.id, plan);
    },
    onMutate: async (plan) => {
      await queryClient.cancelQueries({ queryKey: ['plans'] });
      await queryClient.cancelQueries({ queryKey: ['structure-data'] });

      const snapshot = snapshotPlans(queryClient);
      if (plan.id) updateCachedPlan(queryClient, plan.id, () => plan);

      return { snapshot };
    },
    onError: (_error, _plan, context) => {
      if (context) restorePlans(queryClient, context.snapshot);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['plans'] });
      await queryClient.invalidateQueries({ queryKey: ['structure-data'] });
      await queryClient.invalidateQueries({ queryKey: ['timeline-courses'] });
    },
  });
};
