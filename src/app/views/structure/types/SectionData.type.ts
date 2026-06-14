import { CourseEntry } from './CourseEntry.type';
import { StructureSelectionGroup } from '@/app/views/structure/types/StructureSelectionGroup.type';

export type SectionData = {
  moduleId: string;
  name: string;
  targetCredits: number;
  minimumCredits: number;
  completedCredits: number;
  instructions: string | null;
  courses: CourseEntry[];
  selectionGroups: StructureSelectionGroup[];
  supportsFreeCourseSearch: boolean;
};
