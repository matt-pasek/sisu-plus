export type PlacedSelectionShape = {
  courseUnitId: string;
  parentModuleId?: string;
  substitutedBy?: string[];
  substituteFor?: { substitutedCourseUnitId: string }[];
};

// Sisu stores a substitute without a parentModuleId; it occupies the slot of the course it substitutes,
// while that course stays in the plan with substitutedBy set.
export const getPlacedCourseUnitSelections = <T extends PlacedSelectionShape>(selections: T[]): T[] => {
  const byCourseUnitId = new Map(selections.map((selection) => [selection.courseUnitId, selection]));

  const isSubstituted = (selection: T) => (selection.substitutedBy ?? []).some((id) => byCourseUnitId.has(id));

  const inheritedParentModuleId = (selection: T) =>
    (selection.substituteFor ?? [])
      .map((entry) => byCourseUnitId.get(entry.substitutedCourseUnitId)?.parentModuleId)
      .find((parentModuleId) => parentModuleId != null);

  return selections
    .filter((selection) => !isSubstituted(selection))
    .map((selection) => {
      if (selection.parentModuleId) return selection;
      const parentModuleId = inheritedParentModuleId(selection);
      return parentModuleId ? { ...selection, parentModuleId } : selection;
    });
};
