import { useQueryClient } from '@tanstack/react-query';
import { fetchAttainments } from '@/app/api/endpoints/attainments';
import { fetchEnrolments } from '@/app/api/endpoints/enrolments';
import { fetchPlans } from '@/app/api/endpoints/plans';
import { fetchStudyRights } from '@/app/api/endpoints/studyRights';
import { koriApi } from '@/app/api/client';
import { findCachedPrimaryPlan } from '@/app/api/dataPoints/planCache';
import { isPassingCourseUnitAttainment } from '@/app/api/dataPoints/util';
import type { CourseUnitAttainmentRestricted } from '@/app/api/generated/OriApi';
import type {
  CourseUnit,
  CurriculumPeriod,
  LocalizedMarkupString,
  LocalizedString,
  Module,
} from '@/app/api/generated/KoriApi';
import type { Plan } from '@/app/api/generated/OsuvaApi';
import {
  fetchModuleChildren,
  fetchModuleDocument,
  fetchRuleOptions,
} from '@/app/api/dataPoints/structure/fetchRuleOptions';
import {
  getRuleRange,
  hasAnyCourseRule,
  ruleChildren,
  type EditableRule,
} from '@/app/api/dataPoints/structure/ruleTree';
import { stripMarkup } from '@/app/api/dataPoints/structure/markup';
import { getTopLevelModuleIds } from '@/app/api/dataPoints/structure/topLevelModules';
import { buildCuToTopModuleMap } from '@/app/api/resolvers/helpers/buildCuToTopModuleMap';
import {
  getPlacedCourseUnitSelections,
  type PlacedSelectionShape,
} from '@/app/api/resolvers/helpers/placedCourseUnitSelections';
import { pickLabel } from '@/app/api/resolvers/helpers/pickLabel';
import { resolveCourseUnit } from '@/app/api/resolvers/resolveCourseUnit';
import { resolveModule } from '@/app/api/resolvers/resolveModule';
import { formatAppDate } from '@/app/helpers/formatAppDate';
import { getCurrentLocale } from '@/app/i18n';
import { useSisuQuery } from '@/app/hooks/useSisuQuery';
import { CourseEntry, StructureData, StructureOption, StructureSelectionGroup } from '@/app/views/structure/types';

type StructurePlan = {
  id?: string;
  name?: string;
  rootId: string;
  curriculumPeriodId: string;
  metadata?: Record<string, unknown>;
  moduleSelections: { moduleId: string; parentModuleId?: string }[];
  courseUnitSelections: (PlacedSelectionShape & { completionMethodId?: string })[];
};

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

function formatMetadataDate(value: unknown): string | null {
  if (typeof value !== 'string' && typeof value !== 'number' && !(value instanceof Date)) return null;
  const formatted = formatAppDate(value, '');
  return formatted || null;
}

function pickPlanMetadataValue(plan: StructurePlan, keys: string[]): unknown {
  const planRecord = plan as unknown as Record<string, unknown>;
  for (const key of keys) {
    if (planRecord[key] != null) return planRecord[key];
    if (plan.metadata?.[key] != null) return plan.metadata[key];
  }
  return null;
}

function pickMarkup(markup: LocalizedMarkupString | undefined): string | null {
  return stripMarkup(markup ? pickLabel(markup as unknown as LocalizedString) : null);
}

async function fetchCurriculumPeriod(curriculumPeriodId: string): Promise<CurriculumPeriod | null> {
  try {
    const response = await koriApi.api.getCurriculumPeriod(curriculumPeriodId);
    return response.data as CurriculumPeriod;
  } catch {
    return null;
  }
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
  const queryClient = useQueryClient();
  const plansQuery = useSisuQuery(['plans'], fetchPlans);
  const attainmentsQuery = useSisuQuery(['attainments'], fetchAttainments);
  const studyRightsQuery = useSisuQuery(['study-rights'], fetchStudyRights);
  const enrolmentsQuery = useSisuQuery(['enrolments'], fetchEnrolments);

  const { data, isLoading: structureLoading } = useSisuQuery(
    ['structure-data'],
    async (): Promise<StructureData> => {
      const plan = findCachedPrimaryPlan(queryClient) as StructurePlan | undefined;
      if (!plan) {
        return {
          planId: '',
          plan: {} as Plan,
          planName: 'My study plan',
          degreeProgramName: null,
          curriculumPeriodName: null,
          planModifiedOn: null,
          planCreatedOn: null,
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
      const enrolledCourseUnitIds = new Set(
        (enrolmentsQuery.data ?? [])
          .filter((e) => e.state === 'ENROLLED' || e.state === 'CONFIRMED')
          .map((e) => e.courseUnitId)
          .filter((id): id is string => id != null),
      );
      const placedSelections = getPlacedCourseUnitSelections(plan.courseUnitSelections);
      const courseUnitIds = placedSelections
        .filter((selection) => cuToTopModule.has(selection.courseUnitId))
        .map((selection) => selection.courseUnitId);
      const substitutedIds = [
        ...new Set(
          placedSelections.flatMap((s) => (s.substituteFor ?? []).map((entry) => entry.substitutedCourseUnitId)),
        ),
      ];

      const [moduleDetails, wrapperDetails, courseUnits, substitutedCourses, curriculumPeriod] = await Promise.all([
        Promise.all(topLevelModuleIds.map(resolveModule)),
        wrapperModuleId ? resolveModule(wrapperModuleId) : Promise.resolve(null),
        Promise.all(courseUnitIds.map(resolveCourseUnit)),
        Promise.all(substitutedIds.map(resolveCourseUnit)),
        fetchCurriculumPeriod(plan.curriculumPeriodId),
      ]);
      const substitutedNames = new Map(
        substitutedIds.map((id, index) => [id, substitutedCourses[index].name ?? substitutedCourses[index].code ?? id]),
      );
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
        const selection = placedSelections.find((s) => s.courseUnitId === courseUnitId);
        const completionMethodId = selection?.completionMethodId ?? null;
        const methodIdx = completionMethodId ? courseUnit.completionMethodLocalIds.indexOf(completionMethodId) : -1;
        const course: CourseEntry = {
          courseUnitId,
          parentModuleId: selection?.parentModuleId ?? null,
          code: courseUnit.code,
          name: courseUnit.name,
          credits: courseUnit.credits,
          completed: attainment != null,
          enrolled: !attainment && enrolledCourseUnitIds.has(courseUnitId),
          grade: getGrade(attainment),
          completionMethodId,
          completionMethodIndex: methodIdx >= 0 ? methodIdx + 1 : null,
          substitutesFor: (selection?.substituteFor ?? []).map(
            (entry) => substitutedNames.get(entry.substitutedCourseUnitId) ?? entry.substitutedCourseUnitId,
          ),
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
        planName: plan.name ?? wrapperDetails?.name ?? 'My study plan',
        degreeProgramName: wrapperDetails?.name ?? null,
        curriculumPeriodName: curriculumPeriod
          ? (pickLabel(curriculumPeriod.name) ?? pickLabel(curriculumPeriod.abbreviation))
          : null,
        planModifiedOn: formatMetadataDate(
          pickPlanMetadataValue(plan, ['lastModifiedOn', 'modifiedOn', 'modifiedAt', 'updatedAt']),
        ),
        planCreatedOn: formatMetadataDate(pickPlanMetadataValue(plan, ['createdOn', 'createdAt'])),
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
