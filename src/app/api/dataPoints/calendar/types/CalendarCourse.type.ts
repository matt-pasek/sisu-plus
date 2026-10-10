export interface CalendarCourse {
  realisationId: string;
  courseUnitId: string | null;
  enrolmentId: string | null;
  name: string;
  colorIndex: number;
  isInCalendar: boolean;
  isExam: boolean;
}
