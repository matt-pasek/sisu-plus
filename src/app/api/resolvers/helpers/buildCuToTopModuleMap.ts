type PlanShape = {
  rootId: string;
  moduleSelections: { moduleId: string; parentModuleId?: string }[];
  courseUnitSelections: { courseUnitId: string; parentModuleId?: string }[];
};

export function buildCuToTopModuleMap(plan: PlanShape): Map<string, string> {
  const moduleToParent = new Map<string, string>();
  for (const ms of plan.moduleSelections) {
    if (ms.parentModuleId) moduleToParent.set(ms.moduleId, ms.parentModuleId);
  }

  let topLevelIds = plan.moduleSelections.filter((ms) => ms.parentModuleId === plan.rootId).map((ms) => ms.moduleId);

  if (topLevelIds.length === 1) {
    const children = plan.moduleSelections
      .filter((ms) => ms.parentModuleId === topLevelIds[0])
      .map((ms) => ms.moduleId);
    if (children.length > 0) topLevelIds = children;
  }

  const topLevelSet = new Set(topLevelIds);
  const cuToTopModule = new Map<string, string>();
  for (const cs of plan.courseUnitSelections) {
    if (!cs.parentModuleId) continue;
    let current = cs.parentModuleId;
    let depth = 0;
    while (current && !topLevelSet.has(current) && depth < 10) {
      current = moduleToParent.get(current) ?? '';
      depth++;
    }
    if (topLevelSet.has(current)) cuToTopModule.set(cs.courseUnitId, current);
  }
  return cuToTopModule;
}
