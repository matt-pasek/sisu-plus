import { Plan } from '@/app/api/generated/OsuvaApi';

export type CourseEntry = {
  courseUnitId: string;
  parentModuleId: string | null;
  code: string | null;
  name: string | null;
  credits: number | null;
  completed: boolean;
  grade: string | null;
};

export type StructureOption = {
  id: string;
  groupId: string;
  type: 'module' | 'course';
  code: string | null;
  name: string;
  credits: number | null;
  selected: boolean;
};

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

export type StructureData = {
  planId: string;
  plan: Plan;
  planName: string;
  studyRightUntil: string | null;
  totalTarget: number;
  degreeMinimumCredits: number | null;
  totalCompleted: number;
  sections: SectionData[];
};
