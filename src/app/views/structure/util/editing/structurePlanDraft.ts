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

const pruneSubstitutionLinks = (selection: CourseUnitSelection, presentIds: Set<string>): CourseUnitSelection => {
  const substitutedBy = selection.substitutedBy?.filter((id) => presentIds.has(id));
  const substituteFor = selection.substituteFor?.filter((entry) => presentIds.has(entry.substitutedCourseUnitId));
  const unchanged =
    substitutedBy?.length === selection.substitutedBy?.length &&
    substituteFor?.length === selection.substituteFor?.length;
  if (unchanged) return selection;
  return { ...selection, ...(substitutedBy && { substitutedBy }), ...(substituteFor && { substituteFor }) };
};

// A substitute has no parentModuleId of its own, so once every course it replaces is gone it would be orphaned.
const withoutDanglingSubstitutions = (plan: Plan): Plan => {
  const presentIds = new Set(plan.courseUnitSelections.map((selection) => selection.courseUnitId));
  const isOrphanedSubstitute = (selection: CourseUnitSelection) =>
    !selection.parentModuleId &&
    (selection.substituteFor ?? []).length > 0 &&
    !(selection.substituteFor ?? []).some((entry) => presentIds.has(entry.substitutedCourseUnitId));

  const kept = plan.courseUnitSelections.filter((selection) => !isOrphanedSubstitute(selection));
  const keptIds = new Set(kept.map((selection) => selection.courseUnitId));

  return { ...plan, courseUnitSelections: kept.map((selection) => pruneSubstitutionLinks(selection, keptIds)) };
};

const withoutNestedSelections = (plan: Plan, removedModuleIds: Set<string>) => {
  const nestedModuleIds = collectDescendantModuleIds(plan.moduleSelections, new Set(removedModuleIds));

  return withoutDanglingSubstitutions({
    ...plan,
    moduleSelections: plan.moduleSelections.filter((selection) => !nestedModuleIds.has(selection.moduleId)),
    courseUnitSelections: plan.courseUnitSelections.filter(
      (selection) => !selection.parentModuleId || !nestedModuleIds.has(selection.parentModuleId),
    ),
  });
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

export const addModuleToModule = (plan: Plan, moduleId: string, parentModuleId: string): Plan => {
  const alreadySelected = plan.moduleSelections.some((selection) => selection.moduleId === moduleId);
  if (alreadySelected) return plan;

  return { ...plan, moduleSelections: [...plan.moduleSelections, { moduleId, parentModuleId }] };
};

export const removeModuleFromPlan = (plan: Plan, moduleId: string): Plan =>
  withoutNestedSelections(plan, new Set([moduleId]));

export const selectCourseOption = (plan: Plan, args: SelectCourseOptionArgs) => {
  const nextSelection: CourseUnitSelection = {
    courseUnitId: args.selectedCourseUnitId,
    parentModuleId: args.parentModuleId,
    plannedPeriods: [],
  };

  return withoutDanglingSubstitutions({
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
  });
};

export const addCourseToModule = (plan: Plan, courseUnitId: string, parentModuleId: string) => {
  const alreadySelected = plan.courseUnitSelections.some((selection) => selection.courseUnitId === courseUnitId);
  if (alreadySelected) return plan;

  return {
    ...plan,
    courseUnitSelections: [...plan.courseUnitSelections, { courseUnitId, parentModuleId, plannedPeriods: [] }],
  };
};

export const removeCourseFromPlan = (plan: Plan, courseUnitId: string) => {
  return withoutDanglingSubstitutions({
    ...plan,
    courseUnitSelections: plan.courseUnitSelections.filter((selection) => selection.courseUnitId !== courseUnitId),
  });
};

export const getSubstituteIds = (plan: Plan, courseUnitId: string): string[] => {
  const presentIds = new Set(plan.courseUnitSelections.map((selection) => selection.courseUnitId));
  const selection = plan.courseUnitSelections.find((candidate) => candidate.courseUnitId === courseUnitId);
  return (selection?.substitutedBy ?? []).filter((id) => presentIds.has(id));
};

export const setCompletionMethod = (plan: Plan, courseUnitId: string, completionMethodId: string) => {
  return {
    ...plan,
    courseUnitSelections: plan.courseUnitSelections.map((s) =>
      s.courseUnitId === courseUnitId ? { ...s, completionMethodId } : s,
    ),
  };
};
