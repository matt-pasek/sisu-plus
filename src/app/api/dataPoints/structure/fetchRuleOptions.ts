import { koriApi } from '@/app/api/client';
import type { CourseUnit, Module } from '@/app/api/generated/KoriApi';
import { collectRuleGroupIds, type EditableRule } from './ruleTree';

export interface RuleOptions {
  modules: Module[];
  courseUnits: CourseUnit[];
}

type Recover = <T>(request: Promise<{ data: T }>, fallback: T) => Promise<{ data: T }>;

const rethrow: Recover = (request) => request;
const swallow: Recover = (request, fallback) => request.catch(() => ({ data: fallback }));

const isNotFound = (error: unknown): boolean =>
  typeof error === 'object' && error !== null && 'status' in error && error.status === 404;

export const fetchModuleDocumentStrict = async (moduleId: string): Promise<Module | null> => {
  try {
    const response = await koriApi.api.getModule(moduleId);
    return response.data as Module;
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
};

export const fetchModuleDocument = (moduleId: string): Promise<Module | null> =>
  fetchModuleDocumentStrict(moduleId).catch(() => null);

export const fetchModuleChildren = async (moduleId: string, curriculumPeriodId: string): Promise<RuleOptions> => {
  const [modulesResponse, courseUnitsResponse] = await Promise.all([
    koriApi.api.getModulesForModule({ moduleId, curriculumPeriodId }).catch(() => ({ data: [] as Module[] })),
    koriApi.api.getCourseUnitsForModule({ moduleId, curriculumPeriodId }).catch(() => ({ data: [] as CourseUnit[] })),
  ]);

  return {
    modules: modulesResponse.data as Module[],
    courseUnits: courseUnitsResponse.data as CourseUnit[],
  };
};

const requestRuleOptions = async (
  module: Module,
  curriculumPeriodId: string,
  recover: Recover,
): Promise<RuleOptions> => {
  const rule = module.rule as unknown as EditableRule;
  const { moduleGroupIds, courseUnitGroupIds } = collectRuleGroupIds(rule);
  const universityId = module.universityOrgIds[0];

  const [modulesResponse, courseUnitsResponse] = await Promise.all([
    universityId && moduleGroupIds.size > 0
      ? recover(
          koriApi.api.findByGroupIdAndCurriculumPeriodId({
            groupId: [...moduleGroupIds],
            universityId,
            curriculumPeriodId,
            documentStates: ['ACTIVE'],
          }),
          [],
        )
      : Promise.resolve({ data: [] }),
    courseUnitGroupIds.size > 0
      ? recover(
          koriApi.api.findByGroupIdsAndCurriculumPeriodIdExact({
            groupId: [...courseUnitGroupIds],
            curriculumPeriodId,
            documentState: ['ACTIVE'],
          }),
          [],
        )
      : Promise.resolve({ data: [] }),
  ]);

  return {
    modules: modulesResponse.data as Module[],
    courseUnits: courseUnitsResponse.data as CourseUnit[],
  };
};

export const fetchRuleOptions = (module: Module, curriculumPeriodId: string): Promise<RuleOptions> =>
  requestRuleOptions(module, curriculumPeriodId, swallow);

export const fetchRuleOptionsStrict = (module: Module, curriculumPeriodId: string): Promise<RuleOptions> =>
  requestRuleOptions(module, curriculumPeriodId, rethrow);
