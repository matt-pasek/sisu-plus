export type CourseEntry = {
  courseUnitId: string;
  code: string | null;
  name: string | null;
  credits: number | null;
  completed: boolean;
  grade: string | null;
};

export type SectionData = {
  moduleId: string;
  name: string;
  targetCredits: number;
  minimumCredits: number;
  completedCredits: number;
  courses: CourseEntry[];
};

export type StructureData = {
  planName: string;
  studyRightUntil: string | null;
  totalTarget: number;
  degreeMinimumCredits: number | null;
  totalCompleted: number;
  sections: SectionData[];
};
