import { StructureOption } from './StructureOption.type';

export type StructureSelectionGroup = {
  id: string;
  parentModuleId: string;
  title: string;
  instructions: string | null;
  min: number | null;
  max: number | null;
  creditsMin: number | null;
  creditsMax: number | null;
  options: StructureOption[];
};
