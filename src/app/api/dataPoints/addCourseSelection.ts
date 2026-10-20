import type { CourseUnitSelection, Plan } from '@/app/api/generated/OsuvaApi';

export interface CourseSelectionInput {
  courseUnitId: string;
  courseUnitGroupId?: string | null;
  parentModuleId: string;
  plannedPeriodLocators?: string[];
}

type PlanModules = Pick<Plan, 'rootId' | 'moduleSelections'>;

export const assertModuleInPlan = (plan: PlanModules, moduleId: string): void => {
  const selected =
    moduleId === plan.rootId || plan.moduleSelections.some((selection) => selection.moduleId === moduleId);
  if (!selected) throw new Error('The target module is no longer in the plan.');
};

export const assertCourseAddable = (plan: Plan, input: CourseSelectionInput, plannedGroupIds: Set<string>): void => {
  assertModuleInPlan(plan, input.parentModuleId);
  const selectedById = plan.courseUnitSelections.some((selection) => selection.courseUnitId === input.courseUnitId);
  const selectedByGroup = !!input.courseUnitGroupId && plannedGroupIds.has(input.courseUnitGroupId);
  if (selectedById || selectedByGroup) throw new Error('The course is already in the plan.');
};

export const addCourseSelection = (plan: Plan, input: CourseSelectionInput): Plan => {
  if (plan.courseUnitSelections.some((selection) => selection.courseUnitId === input.courseUnitId)) return plan;

  const selection: CourseUnitSelection = {
    courseUnitId: input.courseUnitId,
    parentModuleId: input.parentModuleId,
    plannedPeriods: input.plannedPeriodLocators ?? [],
  };
  return { ...plan, courseUnitSelections: [...plan.courseUnitSelections, selection] };
};
