import type { QueryClient, QueryKey } from '@tanstack/react-query';
import type { Plan } from '@/app/api/generated/OsuvaApi';

export const PLAN_WRITE_KEY = ['plan-write'] as const;

const PLANS_FILTER = { queryKey: ['plans'] };

export type PlansSnapshot = Array<[QueryKey, Plan[] | undefined]>;

export const findCachedPlan = (queryClient: QueryClient, planId: string): Plan | undefined => {
  for (const [, plans] of queryClient.getQueriesData<Plan[]>(PLANS_FILTER)) {
    const plan = plans?.find((candidate) => candidate.id === planId);
    if (plan) return plan;
  }
  return undefined;
};

export const snapshotPlans = (queryClient: QueryClient): PlansSnapshot =>
  queryClient.getQueriesData<Plan[]>(PLANS_FILTER);

export const restorePlans = (queryClient: QueryClient, snapshot: PlansSnapshot): void => {
  for (const [queryKey, plans] of snapshot) queryClient.setQueryData(queryKey, plans);
};

export const updateCachedPlan = (queryClient: QueryClient, planId: string, update: (plan: Plan) => Plan): void => {
  queryClient.setQueriesData<Plan[]>(PLANS_FILTER, (plans) =>
    plans?.map((plan) => (plan.id === planId ? update(plan) : plan)),
  );
};
