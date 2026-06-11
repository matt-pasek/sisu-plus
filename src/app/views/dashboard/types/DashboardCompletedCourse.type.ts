export interface DashboardCompletedCourse {
  id: string;
  courseUnitId: string;
  name: string;
  code: string | null;
  credits: number;
  grade: number | string | null;
  registrationDate: string;
  attainmentDate: string;
}
