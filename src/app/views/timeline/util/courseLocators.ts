import type { TimelineCourse } from '@/app/api/dataPoints/getTimelineCourses';

export const sameLocators = (first: string[], second: string[]) =>
  first.length === second.length && first.every((locator, index) => locator === second[index]);

export const getCourseLocators = (course: TimelineCourse) => course.plannedPeriods.map((period) => period.locator);
