import type { QueryClient, QueryKey } from '@tanstack/react-query';
import type { TimelineCourse } from '@/app/api/dataPoints/getTimelineCourses';

export type TimelineCoursesSnapshot = Array<[QueryKey, TimelineCourse[] | undefined]>;

const coursesFilter = (planId: string) => ({ queryKey: ['timeline-courses', planId] });

export const insertTimelineCourse = (courses: TimelineCourse[], course: TimelineCourse): TimelineCourse[] =>
  courses.some((existing) => existing.courseUnitId === course.courseUnitId) ? courses : [...courses, course];

export const removeTimelineCourse = (courses: TimelineCourse[], courseUnitId: string): TimelineCourse[] =>
  courses.filter((course) => course.courseUnitId !== courseUnitId);

export const snapshotTimelineCourses = (queryClient: QueryClient, planId: string): TimelineCoursesSnapshot =>
  queryClient.getQueriesData<TimelineCourse[]>(coursesFilter(planId));

export const restoreTimelineCourses = (queryClient: QueryClient, snapshot: TimelineCoursesSnapshot): void => {
  for (const [queryKey, courses] of snapshot) queryClient.setQueryData(queryKey, courses);
};

export const updateTimelineCourses = (
  queryClient: QueryClient,
  planId: string,
  update: (courses: TimelineCourse[]) => TimelineCourse[],
): void => {
  queryClient.setQueriesData<TimelineCourse[]>(coursesFilter(planId), (courses) =>
    courses ? update(courses) : courses,
  );
};

export const getCachedCourseGroupIds = (
  queryClient: QueryClient,
  planId: string,
  courseUnitIds: Set<string>,
): Set<string> =>
  new Set(
    snapshotTimelineCourses(queryClient, planId).flatMap(([, courses]) =>
      (courses ?? []).flatMap((course) =>
        course.courseUnitGroupId && courseUnitIds.has(course.courseUnitId) ? [course.courseUnitGroupId] : [],
      ),
    ),
  );

export const invalidatePlanWrite = async (queryClient: QueryClient, planId: string): Promise<void> => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['plans'] }),
    queryClient.invalidateQueries({ queryKey: ['timeline-courses', planId] }),
    queryClient.invalidateQueries({ queryKey: ['timeline-prerequisites', planId] }),
    queryClient.invalidateQueries({ queryKey: ['structure-data'] }),
  ]);
};
