import type { RuleOptions } from '@/app/api/dataPoints/structure/fetchRuleOptions';
import { hasAnyCourseRule, type EditableRule } from '@/app/api/dataPoints/structure/ruleTree';
import { getTopLevelModuleIds } from '@/app/api/dataPoints/structure/topLevelModules';
import type { Module } from '@/app/api/generated/KoriApi';
import type { Plan } from '@/app/api/generated/OsuvaApi';
import { buildOptionGroups, type LocalizedText, type PickText, type PlanOptionGroup } from './buildOptionGroups';

export interface FreeSearchModule {
  moduleId: string;
  sectionId: string;
  sectionName: string;
  name: string;
}

export interface PlanOptions {
  groups: PlanOptionGroup[];
  freeSearchModules: FreeSearchModule[];
}

export interface PlanOptionFetchers {
  fetchModuleDocument: (moduleId: string) => Promise<Module | null>;
  fetchRuleOptions: (module: Module, curriculumPeriodId: string) => Promise<RuleOptions>;
}

type WalkablePlan = Pick<Plan, 'rootId' | 'curriculumPeriodId' | 'moduleSelections'>;

export const walkPlanOptions = async (
  plan: WalkablePlan,
  fetchers: PlanOptionFetchers,
  pickText: PickText,
): Promise<PlanOptions> => {
  const visited = new Set<string>();

  const loadModule = async (moduleId: string, isSection: boolean) => {
    try {
      const doc = await fetchers.fetchModuleDocument(moduleId);
      return doc ? { doc, options: await fetchers.fetchRuleOptions(doc, plan.curriculumPeriodId) } : null;
    } catch (error) {
      if (isSection) throw error;
      return null;
    }
  };

  const walkModule = async (moduleId: string, section: { id: string; name: string } | null): Promise<PlanOptions> => {
    if (visited.has(moduleId)) return { groups: [], freeSearchModules: [] };
    visited.add(moduleId);

    const loaded = await loadModule(moduleId, section === null);
    if (!loaded) return { groups: [], freeSearchModules: [] };
    const { doc, options } = loaded;

    const docName = pickText(doc.name as unknown as LocalizedText) ?? doc.code ?? moduleId;
    const sectionId = section?.id ?? moduleId;
    const sectionName = section?.name ?? docName;
    const owningId = doc.id ?? doc.groupId;

    const groups = buildOptionGroups({
      module: doc,
      moduleName: docName,
      sectionId,
      sectionName,
      courseUnits: options.courseUnits,
      pickText,
    });
    const freeSearchModules = hasAnyCourseRule(doc.rule as unknown as EditableRule)
      ? [{ moduleId: owningId, sectionId, sectionName, name: docName }]
      : [];

    const childIds = plan.moduleSelections
      .filter((selection) => selection.parentModuleId === moduleId)
      .map((selection) => selection.moduleId);
    const children: PlanOptions[] = [];
    for (const childId of childIds) {
      children.push(await walkModule(childId, { id: sectionId, name: sectionName }));
    }

    return {
      groups: [...groups, ...children.flatMap((child) => child.groups)],
      freeSearchModules: [...freeSearchModules, ...children.flatMap((child) => child.freeSearchModules)],
    };
  };

  const { topLevelModuleIds } = getTopLevelModuleIds(plan);
  const sections: PlanOptions[] = [];
  for (const moduleId of topLevelModuleIds) sections.push(await walkModule(moduleId, null));

  return {
    groups: sections.flatMap((section) => section.groups),
    freeSearchModules: sections.flatMap((section) => section.freeSearchModules),
  };
};
