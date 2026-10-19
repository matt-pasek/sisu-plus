import type { TimelineCourse } from '@/app/api/dataPoints/getTimelineCourses';

export const sameLocators = (first: string[], second: string[]) =>
  first.length === second.length && first.every((locator, index) => locator === second[index]);

export const getCourseLocators = (course: TimelineCourse) => course.plannedPeriods.map((period) => period.locator);

export const getResizedLocators = (
  currentLocators: string[],
  visibleLocators: string[],
  delta: number,
): string[] | null => {
  if (currentLocators.length === 0) return null;

  const startIndex = visibleLocators.indexOf(currentLocators[0]);
  if (startIndex === -1) return null;

  const newLength = Math.max(1, currentLocators.length + delta);
  return visibleLocators.slice(startIndex, startIndex + newLength);
};
