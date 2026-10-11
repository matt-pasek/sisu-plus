export interface CalendarDataOptions {
  candidateCourseKeys: string[];
  onPlanWriteError: () => void;
  span: 'term' | 'academicYear';
}
