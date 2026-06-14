import type { TimelineCourse } from '@/app/api/dataPoints/getTimelineCourses';

export const getCourseStartDate = (course: TimelineCourse) => {
  const startDates = course.plannedPeriods.map((period) => period.startDate);
  if (startDates.length === 0) return null;
  return startDates.reduce((earliest, current) => (current < earliest ? current : earliest));
};

export const getCourseEndDate = (course: TimelineCourse) => {
  const endDates = course.plannedPeriods.map((period) => period.endDate);
  if (endDates.length === 0) return null;
  return endDates.reduce((latest, current) => (current > latest ? current : latest));
};
