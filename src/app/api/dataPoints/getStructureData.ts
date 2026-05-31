import { fetchAttainments } from '@/app/api/endpoints/attainments';
import { fetchPlans } from '@/app/api/endpoints/plans';
import { fetchStudyRights } from '@/app/api/endpoints/studyRights';
import { koriApi } from '@/app/api/client';
import type { CourseUnitAttainmentRestricted } from '@/app/api/generated/OriApi';
import type { CourseUnit, LocalizedMarkupString, LocalizedString, Module } from '@/app/api/generated/KoriApi';
import type { Plan } from '@/app/api/generated/OsuvaApi';
import { buildCuToTopModuleMap } from '@/app/api/resolvers/helpers/buildCuToTopModuleMap';
import { pickLabel } from '@/app/api/resolvers/helpers/pickLabel';
import { resolveCourseUnit } from '@/app/api/resolvers/resolveCourseUnit';
import { resolveModule } from '@/app/api/resolvers/resolveModule';
import { getCurrentLocale } from '@/app/i18n';
import { useSisuQuery } from '@/app/hooks/useSisuQuery';
import type {
  CourseEntry,
  StructureData,
  StructureOption,
  StructureSelectionGroup,
} from '@/app/views/structure/structureTypes';

type StructurePlan = {
  id?: string;
  rootId: string;
  curriculumPeriodId: string;
  moduleSelections: { moduleId: string; parentModuleId?: string }[];
  courseUnitSelections: { courseUnitId: string; parentModuleId?: string }[];
};

type EditableRule = {
  type: string;
  localId?: string;
  rules?: EditableRule[];
  rule?: EditableRule;
  require?: { min: number; max?: number };
  count?: { min: number; max?: number };
  credits?: { min: number; max?: number };
  description?: LocalizedMarkupString;
  moduleGroupId?: string;
  courseUnitGroupId?: string;
};

function getTopLevelModuleIds(plan: StructurePlan): { topLevelModuleIds: string[]; wrapperModuleId: string | null } {
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
}

function isPassingCourseUnitAttainment(attainment: unknown): attainment is CourseUnitAttainmentRestricted {
  const candidate = attainment as Partial<CourseUnitAttainmentRestricted>;
  return candidate.type === 'CourseUnitAttainment' && candidate.primary === true && candidate.state !== 'FAILED';
}

function getGrade(attainment: CourseUnitAttainmentRestricted | undefined): string | null {
  if (!attainment) return null;
  if (attainment.gradeScaleId.includes('hyl-hyv')) return attainment.gradeId != null ? 'Pass' : null;
  return attainment.gradeId >= 1 && attainment.gradeId <= 5
    ? String(attainment.gradeId)
    : String(attainment.gradeId ?? 'Pass');
}

function formatStudyRightUntil(endDate: string | undefined): string | null {
  if (!endDate) return null;
  const date = new Date(endDate);
  date.setDate(date.getDate() - 1);
  return date.toLocaleDateString(getCurrentLocale(), { month: 'long', year: 'numeric' });
}

function stripMarkup(value: string | null): string | null {
  return (
    value
      ?.replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim() || null
  );
}

function pickMarkup(markup: LocalizedMarkupString | undefined): string | null {
  return stripMarkup(markup ? pickLabel(markup as unknown as LocalizedString) : null);
}

async function fetchModuleDocument(moduleId: string): Promise<Module | null> {
  try {
    const response = await koriApi.api.getModule(moduleId);
    return response.data as Module;
  } catch {
    return null;
  }
}

async function fetchModuleChildren(
  moduleId: string,
  curriculumPeriodId: string,
): Promise<{
  modules: Module[];
  courseUnits: CourseUnit[];
}> {
  const [modulesResponse, courseUnitsResponse] = await Promise.all([
    koriApi.api.getModulesForModule({ moduleId, curriculumPeriodId }).catch(() => ({ data: [] as Module[] })),
    koriApi.api.getCourseUnitsForModule({ moduleId, curriculumPeriodId }).catch(() => ({ data: [] as CourseUnit[] })),
  ]);

  return {
    modules: modulesResponse.data as Module[],
    courseUnits: courseUnitsResponse.data as CourseUnit[],
  };
}

function collectRuleGroupIds(
  rule: EditableRule,
  result = { moduleGroupIds: new Set<string>(), courseUnitGroupIds: new Set<string>() },
) {
  if (rule.type === 'ModuleRule' && rule.moduleGroupId) result.moduleGroupIds.add(rule.moduleGroupId);
  if (rule.type === 'CourseUnitRule' && rule.courseUnitGroupId) result.courseUnitGroupIds.add(rule.courseUnitGroupId);
  for (const child of ruleChildren(rule)) collectRuleGroupIds(child, result);
  return result;
}

async function fetchRuleOptions(
  section: Module,
  curriculumPeriodId: string,
): Promise<{
  modules: Module[];
  courseUnits: CourseUnit[];
}> {
  const rule = section.rule as unknown as EditableRule;
  const { moduleGroupIds, courseUnitGroupIds } = collectRuleGroupIds(rule);
  const universityId = section.universityOrgIds[0];

  const [modulesResponse, courseUnitsResponse] = await Promise.all([
    universityId && moduleGroupIds.size > 0
      ? koriApi.api
          .findByGroupIdAndCurriculumPeriodId({
            groupId: [...moduleGroupIds],
            universityId,
            curriculumPeriodId,
            documentStates: ['ACTIVE'],
          })
          .catch(() => ({ data: [] as Module[] }))
      : Promise.resolve({ data: [] as Module[] }),
    courseUnitGroupIds.size > 0
      ? koriApi.api
          .findByGroupIdsAndCurriculumPeriodIdExact({
            groupId: [...courseUnitGroupIds],
            curriculumPeriodId,
            documentState: ['ACTIVE'],
          })
          .catch(() => ({ data: [] as CourseUnit[] }))
      : Promise.resolve({ data: [] as CourseUnit[] }),
  ]);

  return {
    modules: modulesResponse.data as Module[],
    courseUnits: courseUnitsResponse.data as CourseUnit[],
  };
}

function getRuleRange(rule: EditableRule): {
  min: number | null;
  max: number | null;
  creditsMin: number | null;
  creditsMax: number | null;
} {
  if (rule.type === 'CompositeRule')
    return { min: rule.require?.min ?? null, max: rule.require?.max ?? null, creditsMin: null, creditsMax: null };
  if (rule.type === 'CourseUnitCountRule') {
    return { min: rule.count?.min ?? null, max: rule.count?.max ?? null, creditsMin: null, creditsMax: null };
  }
  if (rule.type === 'CreditsRule') {
    return { min: null, max: null, creditsMin: rule.credits?.min ?? null, creditsMax: rule.credits?.max ?? null };
  }
  return { min: null, max: null, creditsMin: null, creditsMax: null };
}

function ruleChildren(rule: EditableRule): EditableRule[] {
  if (rule.type === 'CompositeRule') return rule.rules ?? [];
  if (rule.type === 'CourseUnitCountRule') return rule.rule ? [rule.rule] : [];
  if (rule.type === 'CreditsRule') return rule.rule ? [rule.rule] : [];
  return [];
}

function hasAnyCourseRule(rule: EditableRule): boolean {
  return rule.type === 'AnyCourseUnitRule' || ruleChildren(rule).some(hasAnyCourseRule);
}

function buildSelectionGroups(args: {
  section: Module;
  modules: Module[];
  courseUnits: CourseUnit[];
  plan: StructurePlan;
}): StructureSelectionGroup[] {
  const moduleByGroup = new Map<string, Module[]>();
  const courseByGroup = new Map<string, CourseUnit[]>();
  for (const module of args.modules)
    moduleByGroup.set(module.groupId, [...(moduleByGroup.get(module.groupId) ?? []), module]);
  for (const course of args.courseUnits)
    courseByGroup.set(course.groupId, [...(courseByGroup.get(course.groupId) ?? []), course]);

  const visit = (rule: EditableRule, fallbackTitle: string): StructureSelectionGroup[] => {
    const children = ruleChildren(rule);
    const options: StructureOption[] = children.flatMap((child): StructureOption[] => {
      if (child.type === 'ModuleRule') {
        return (moduleByGroup.get(child.moduleGroupId ?? '') ?? []).map((module) => ({
          id: module.id ?? module.groupId,
          groupId: module.groupId,
          type: 'module' as const,
          code: module.code ?? null,
          name: pickLabel(module.name) ?? module.code ?? module.id ?? module.groupId,
          credits: (module as unknown as { targetCredits?: { min?: number } }).targetCredits?.min ?? null,
          selected: args.plan.moduleSelections.some((selection) => selection.moduleId === module.id),
        }));
      }
      if (child.type === 'CourseUnitRule') {
        return (courseByGroup.get(child.courseUnitGroupId ?? '') ?? []).map((course) => ({
          id: course.id ?? course.groupId,
          groupId: course.groupId,
          type: 'course' as const,
          code: course.code ?? null,
          name: pickLabel(course.name) ?? course.code ?? course.id ?? course.groupId,
          credits: course.credits?.min ?? null,
          selected: args.plan.courseUnitSelections.some((selection) => selection.courseUnitId === course.id),
        }));
      }
      return [];
    });

    const nested = children.flatMap((child, index) => visit(child, `${fallbackTitle} ${index + 1}`));
    if (options.length < 2) return nested;

    return [
      {
        id: rule.localId ?? `${args.section.id}:${fallbackTitle}`,
        parentModuleId: args.section.id ?? args.section.groupId,
        title: fallbackTitle,
        instructions: pickMarkup(rule.type === 'CompositeRule' ? rule.description : undefined),
        ...getRuleRange(rule),
        options,
      },
      ...nested,
    ];
  };

  return visit(args.section.rule as unknown as EditableRule, 'Selection group');
}

export const getStructureData = (): { data: StructureData | undefined; isLoading: boolean } => {
  const plansQuery = useSisuQuery(['plans'], fetchPlans);
  const attainmentsQuery = useSisuQuery(['attainments'], fetchAttainments);
  const studyRightsQuery = useSisuQuery(['study-rights'], fetchStudyRights);

  const { data, isLoading: structureLoading } = useSisuQuery(
    ['structure-data'],
    async (): Promise<StructureData> => {
      const plan = plansQuery.data?.[0] as StructurePlan | undefined;
      if (!plan) {
        return {
          planId: '',
          plan: {} as Plan,
          planName: 'My study plan',
          studyRightUntil: null,
          totalTarget: 0,
          degreeMinimumCredits: null,
          totalCompleted: 0,
          sections: [],
        };
      }

      const { topLevelModuleIds, wrapperModuleId } = getTopLevelModuleIds(plan);
      const cuToTopModule = buildCuToTopModuleMap(plan);
      const passingAttainments = (attainmentsQuery.data ?? []).filter(isPassingCourseUnitAttainment);
      const passingByCourseUnit = new Map(
        passingAttainments.map((attainment) => [attainment.courseUnitId, attainment]),
      );
      const courseUnitIds = plan.courseUnitSelections
        .filter((selection) => cuToTopModule.has(selection.courseUnitId))
        .map((selection) => selection.courseUnitId);

      const [moduleDetails, wrapperDetails, courseUnits] = await Promise.all([
        Promise.all(topLevelModuleIds.map(resolveModule)),
        wrapperModuleId ? resolveModule(wrapperModuleId) : Promise.resolve(null),
        Promise.all(courseUnitIds.map(resolveCourseUnit)),
      ]);
      const sectionDocuments = await Promise.all(topLevelModuleIds.map(fetchModuleDocument));
      const sectionChildren = await Promise.all(
        sectionDocuments.map((sectionDocument, index) =>
          sectionDocument
            ? fetchRuleOptions(sectionDocument, plan.curriculumPeriodId)
            : fetchModuleChildren(topLevelModuleIds[index], plan.curriculumPeriodId),
        ),
      );

      const coursesByModule = new Map<string, CourseEntry[]>();
      courseUnitIds.forEach((courseUnitId, index) => {
        const moduleId = cuToTopModule.get(courseUnitId);
        if (!moduleId) return;

        const courseUnit = courseUnits[index];
        const attainment = passingByCourseUnit.get(courseUnitId);
        const course: CourseEntry = {
          courseUnitId,
          parentModuleId:
            plan.courseUnitSelections.find((selection) => selection.courseUnitId === courseUnitId)?.parentModuleId ??
            null,
          code: courseUnit.code,
          name: courseUnit.name,
          credits: courseUnit.credits,
          completed: attainment != null,
          grade: getGrade(attainment),
        };

        coursesByModule.set(moduleId, [...(coursesByModule.get(moduleId) ?? []), course]);
      });

      const sections = topLevelModuleIds.map((moduleId, index) => {
        const courses = coursesByModule.get(moduleId) ?? [];
        const completedCredits = courses.reduce(
          (sum, course) => sum + (course.completed ? (course.credits ?? 0) : 0),
          0,
        );
        const plannedCredits = courses.reduce((sum, course) => sum + (course.credits ?? 0), 0);
        return {
          moduleId,
          name: moduleDetails[index].name,
          targetCredits: plannedCredits || moduleDetails[index].targetCredits,
          minimumCredits: moduleDetails[index].targetCredits,
          completedCredits,
          instructions: sectionDocuments[index]
            ? pickMarkup((sectionDocuments[index].rule as unknown as EditableRule).description)
            : null,
          courses,
          selectionGroups: sectionDocuments[index]
            ? buildSelectionGroups({
                section: sectionDocuments[index],
                modules: sectionChildren[index].modules,
                courseUnits: sectionChildren[index].courseUnits,
                plan,
              })
            : [],
          supportsFreeCourseSearch: sectionDocuments[index] ? hasAnyCourseRule(sectionDocuments[index].rule) : false,
        };
      });

      const activeStudyRight =
        studyRightsQuery.data?.find(
          (studyRight) => studyRight.state === 'ACTIVE' || studyRight.state === 'ACTIVE_NONATTENDING',
        ) ?? studyRightsQuery.data?.[0];

      return {
        planId: plan.id ?? '',
        plan: plan as Plan,
        planName: wrapperDetails?.name ?? 'My study plan',
        studyRightUntil: formatStudyRightUntil(activeStudyRight?.valid?.endDate),
        totalTarget: sections.reduce((sum, section) => sum + section.targetCredits, 0),
        degreeMinimumCredits: wrapperDetails?.targetCredits ?? null,
        totalCompleted: sections.reduce((sum, section) => sum + section.completedCredits, 0),
        sections,
      };
    },
    { enabled: plansQuery.data != null && attainmentsQuery.data != null && studyRightsQuery.data != null },
  );

  return {
    data,
    isLoading: plansQuery.isLoading || attainmentsQuery.isLoading || studyRightsQuery.isLoading || structureLoading,
  };
};
