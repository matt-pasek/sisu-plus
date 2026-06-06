import type { CourseUnitSelection, ModuleSelection, Plan } from '@/app/api/generated/OsuvaApi';

export type SelectModuleOptionArgs = {
  parentModuleId: string;
  selectedModuleId: string;
  optionModuleIds: string[];
};

export type SelectCourseOptionArgs = {
  parentModuleId: string;
  selectedCourseUnitId: string;
  optionCourseUnitIds: string[];
};

const collectDescendantModuleIds = (moduleSelections: ModuleSelection[], removedModuleIds: Set<string>) => {
  let changed = true;
  while (changed) {
    changed = false;
    for (const selection of moduleSelections) {
      if (
        selection.parentModuleId &&
        removedModuleIds.has(selection.parentModuleId) &&
        !removedModuleIds.has(selection.moduleId)
      ) {
        removedModuleIds.add(selection.moduleId);
        changed = true;
      }
    }
  }
  return removedModuleIds;
};

const withoutNestedSelections = (plan: Plan, removedModuleIds: Set<string>) => {
  const nestedModuleIds = collectDescendantModuleIds(plan.moduleSelections, new Set(removedModuleIds));

  return {
    ...plan,
    moduleSelections: plan.moduleSelections.filter((selection) => !nestedModuleIds.has(selection.moduleId)),
    courseUnitSelections: plan.courseUnitSelections.filter(
      (selection) => !selection.parentModuleId || !nestedModuleIds.has(selection.parentModuleId),
    ),
  };
};

export const selectModuleOption = (plan: Plan, args: SelectModuleOptionArgs) => {
  const previousOptionIds = new Set(
    plan.moduleSelections
      .filter(
        (selection) =>
          selection.parentModuleId === args.parentModuleId && args.optionModuleIds.includes(selection.moduleId),
      )
      .map((selection) => selection.moduleId),
  );
  previousOptionIds.delete(args.selectedModuleId);

  const cleanedPlan = withoutNestedSelections(plan, previousOptionIds);
  const alreadySelected = cleanedPlan.moduleSelections.some(
    (selection) => selection.moduleId === args.selectedModuleId && selection.parentModuleId === args.parentModuleId,
  );

  if (alreadySelected) return cleanedPlan;

  return {
    ...cleanedPlan,
    moduleSelections: [
      ...cleanedPlan.moduleSelections,
      { moduleId: args.selectedModuleId, parentModuleId: args.parentModuleId },
    ],
  };
};

export const selectCourseOption = (plan: Plan, args: SelectCourseOptionArgs) => {
  const nextSelection: CourseUnitSelection = {
    courseUnitId: args.selectedCourseUnitId,
    parentModuleId: args.parentModuleId,
    plannedPeriods: [],
  };

  return {
    ...plan,
    courseUnitSelections: [
      ...plan.courseUnitSelections.filter(
        (selection) =>
          selection.parentModuleId !== args.parentModuleId ||
          !args.optionCourseUnitIds.includes(selection.courseUnitId) ||
          selection.courseUnitId === args.selectedCourseUnitId,
      ),
      ...(plan.courseUnitSelections.some(
        (selection) =>
          selection.courseUnitId === args.selectedCourseUnitId && selection.parentModuleId === args.parentModuleId,
      )
        ? []
        : [nextSelection]),
    ],
  };
};

export const addCourseToModule = (plan: Plan, courseUnitId: string, parentModuleId: string) => {
  const alreadySelected = plan.courseUnitSelections.some((selection) => selection.courseUnitId === courseUnitId);
  if (alreadySelected) return plan;

  return {
    ...plan,
    courseUnitSelections: [...plan.courseUnitSelections, { courseUnitId, parentModuleId, plannedPeriods: [] }],
  };
};

export const removeCourseFromModule = (plan: Plan, courseUnitId: string, parentModuleId: string) => {
  return {
    ...plan,
    courseUnitSelections: plan.courseUnitSelections.filter(
      (selection) => selection.courseUnitId !== courseUnitId || selection.parentModuleId !== parentModuleId,
    ),
  };
};

export const setCompletionMethod = (plan: Plan, courseUnitId: string, completionMethodId: string) => {
  return {
    ...plan,
    courseUnitSelections: plan.courseUnitSelections.map((s) =>
      s.courseUnitId === courseUnitId ? { ...s, completionMethodId } : s,
    ),
  };
};
