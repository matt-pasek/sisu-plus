import { StructureSelectionGroup } from '@/app/views/structure/types';

const normalizeInstructions = (value: string) => {
  return value.replace(/\s+/g, ' ').trim().toLocaleLowerCase();
};

export const getSectionInstructionsForEdit = (
  sectionInstructions: string | null,
  groups: StructureSelectionGroup[],
) => {
  if (!sectionInstructions) return null;

  const normalizedSectionInstructions = normalizeInstructions(sectionInstructions);
  const hasSameGroupInstructions = groups.some(
    (group) => group.instructions && normalizeInstructions(group.instructions) === normalizedSectionInstructions,
  );

  return hasSameGroupInstructions ? null : sectionInstructions;
};
