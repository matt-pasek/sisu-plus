import type { TimelineCourse } from '@/app/api/dataPoints/getTimelineCourses';

export const getStatusClass = (course: TimelineCourse) => {
  if (course.isPassed) return 'border-lighterGreen/20 bg-lighterGreen/10 text-lighterGreen';
  if (course.isEnrolled) return 'border-blue-400/20 bg-blue-400/10 text-blue-300';
  return 'border-warn/20 bg-warn/10 text-warn';
};
