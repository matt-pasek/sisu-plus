import type { TimelineCourse } from '@/app/api/dataPoints/getTimelineCourses';

export const sortCourses = (courses: TimelineCourse[]) => {
  return [...courses].sort((a, b) => {
    if (a.isPassed !== b.isPassed) return a.isPassed ? -1 : 1;
    if (a.isEnrolled !== b.isEnrolled) return a.isEnrolled ? -1 : 1;
    return (a.courseName ?? '').localeCompare(b.courseName ?? '');
  });
};
