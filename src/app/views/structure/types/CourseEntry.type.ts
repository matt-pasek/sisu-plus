export type CourseEntry = {
  courseUnitId: string;
  parentModuleId: string | null;
  code: string | null;
  name: string | null;
  credits: number | null;
  completed: boolean;
  enrolled: boolean;
  grade: string | null;
  completionMethodId: string | null;
  completionMethodIndex: number | null;
};
