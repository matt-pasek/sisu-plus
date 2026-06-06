import { RegistrationImplementation } from '@/app/api/dataPoints/getRegistrationCourses';
import { SelectionState } from '@/app/views/registration/types';

export const getDefaultSelections = (implementation: RegistrationImplementation | null): SelectionState => {
  if (!implementation) return {};
  return Object.fromEntries(
    implementation.studyGroupSets.map((set) => [
      set.id,
      set.subGroups.length <= set.min ? set.subGroups.map((sg) => sg.id) : [],
    ]),
  );
};

export const isSelectionValid = (
  implementation: RegistrationImplementation | null,
  selections: SelectionState,
): boolean => {
  if (!implementation) return false;
  return implementation.studyGroupSets.every((set) => {
    const count = selections[set.id]?.length ?? 0;
    return count >= set.min && (set.max == null || count <= set.max);
  });
};
