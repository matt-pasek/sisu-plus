import type { QueryClient, QueryKey } from '@tanstack/react-query';
import type { Plan } from '@/app/api/generated/OsuvaApi';

export const PLAN_WRITE_KEY = ['plan-write'] as const;
export const PLAN_WRITE_SCOPE = { id: 'plan-write' } as const;

const PLANS_FILTER = { queryKey: ['plans'] };

interface PlansCopy {
  queryKey: QueryKey;
  plans: Plan[] | undefined;
  updatedAt: number;
}

export type PlansSnapshot = PlansCopy[];

const getPlanCopies = (queryClient: QueryClient): PlansCopy[] =>
  queryClient
    .getQueryCache()
    .findAll(PLANS_FILTER)
    .map((query) => ({
      queryKey: query.queryKey,
      plans: Array.isArray(query.state.data) ? (query.state.data as Plan[]) : undefined,
      updatedAt: query.state.dataUpdatedAt,
    }));

const getFreshestCopy = (copies: PlansCopy[]): PlansCopy | undefined =>
  copies.reduce<PlansCopy | undefined>(
    (freshest, copy) => (copy.plans && (!freshest || copy.updatedAt > freshest.updatedAt) ? copy : freshest),
    undefined,
  );

export const findCachedPlan = (queryClient: QueryClient, planId: string): Plan | undefined =>
  getFreshestCopy(
    getPlanCopies(queryClient).filter((copy) => copy.plans?.some((candidate) => candidate.id === planId)),
  )?.plans?.find((candidate) => candidate.id === planId);

export const findCachedPrimaryPlan = (queryClient: QueryClient): Plan | undefined => {
  const plans = getFreshestCopy(getPlanCopies(queryClient))?.plans;
  return plans?.find((plan) => plan.primary) ?? plans?.[0];
};

export const snapshotPlans = (queryClient: QueryClient): PlansSnapshot => getPlanCopies(queryClient);

// Writes keep each copy's original timestamp so findCachedPlan's freshest-copy ordering survives them.
export const restorePlans = (queryClient: QueryClient, snapshot: PlansSnapshot): void => {
  for (const { queryKey, plans, updatedAt } of snapshot) queryClient.setQueryData(queryKey, plans, { updatedAt });
};

// Only the freshest copy moves to now: it stays first in line and stops looking stale to a panel
// mounted mid-write, while older language copies keep their timestamps and still refetch.
export const updateCachedPlan = (queryClient: QueryClient, planId: string, update: (plan: Plan) => Plan): void => {
  const copies = getPlanCopies(queryClient).filter((copy) => copy.plans?.some((plan) => plan.id === planId));
  const freshest = getFreshestCopy(copies);
  for (const copy of copies) {
    const next = copy.plans?.map((plan) => (plan.id === planId ? update(plan) : plan));
    queryClient.setQueryData(copy.queryKey, next, { updatedAt: copy === freshest ? Date.now() : copy.updatedAt });
  }
};
