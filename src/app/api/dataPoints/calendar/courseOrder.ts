import type { CalendarCourse } from './types';

export const compareCourses = (a: CalendarCourse, b: CalendarCourse): number =>
  Number(a.isExam) - Number(b.isExam) || a.name.localeCompare(b.name);
