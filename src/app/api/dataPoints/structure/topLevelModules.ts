import type { Plan } from '@/app/api/generated/OsuvaApi';

export const getTopLevelModuleIds = (
  plan: Pick<Plan, 'rootId' | 'moduleSelections'>,
): { topLevelModuleIds: string[]; wrapperModuleId: string | null } => {
  let topLevelModuleIds = plan.moduleSelections
    .filter((selection) => selection.parentModuleId === plan.rootId)
    .map((selection) => selection.moduleId);

  let wrapperModuleId: string | null = null;
  if (topLevelModuleIds.length === 1) {
    wrapperModuleId = topLevelModuleIds[0];
    const children = plan.moduleSelections
      .filter((selection) => selection.parentModuleId === wrapperModuleId)
      .map((selection) => selection.moduleId);
    if (children.length > 0) topLevelModuleIds = children;
  }

  return { topLevelModuleIds, wrapperModuleId };
};
