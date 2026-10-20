import { walkPlanOptions, type PlanOptions } from '@/app/api/dataPoints/planOptions/walkPlanOptions';
import type { Plan } from '@/app/api/generated/OsuvaApi';
import { useSisuQuery } from '@/app/hooks/useSisuQuery';

const getModuleSignature = (plan: Plan | undefined): string =>
  (plan?.moduleSelections ?? [])
    .map((selection) => `${selection.moduleId}:${selection.parentModuleId ?? ''}`)
    .sort()
    .join(',');

export const getPlanOptions = (
  plan: Plan | undefined,
  enabled: boolean,
): { data: PlanOptions | undefined; isLoading: boolean; isError: boolean } => {
  const { data, isLoading, isError } = useSisuQuery<PlanOptions>(
    ['plan-options', plan?.id, getModuleSignature(plan)],
    () => (plan ? walkPlanOptions(plan) : Promise.resolve({ groups: [], freeSearchModules: [] })),
    { enabled: enabled && plan != null },
  );
  return { data, isLoading, isError };
};
