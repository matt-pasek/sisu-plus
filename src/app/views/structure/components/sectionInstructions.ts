import type { StructureSelectionGroup } from '@/app/views/structure/structureTypes';

function normalizeInstructions(value: string): string {
  return value.replace(/\s+/g, ' ').trim().toLocaleLowerCase();
}

export function getSectionInstructionsForEdit(
  sectionInstructions: string | null,
  groups: StructureSelectionGroup[],
): string | null {
  if (!sectionInstructions) return null;

  const normalizedSectionInstructions = normalizeInstructions(sectionInstructions);
  const hasSameGroupInstructions = groups.some(
    (group) => group.instructions && normalizeInstructions(group.instructions) === normalizedSectionInstructions,
  );

  return hasSameGroupInstructions ? null : sectionInstructions;
}
