import type { TimelineCourse } from '@/app/api/dataPoints/getTimelineCourses';

export const getCourseKey = (course: TimelineCourse): string => course.courseUnitId;
