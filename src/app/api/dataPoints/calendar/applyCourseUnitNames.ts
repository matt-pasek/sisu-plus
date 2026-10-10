import { compareCourses } from './courseOrder';
import type { CalendarRowsResult, CourseUnitInfo } from './types';

// Realisation names describe the teaching ("Contact teaching, Lahti"); the course unit carries the course's name.
export const applyCourseUnitNames = (
  rows: CalendarRowsResult,
  courseUnits: Record<string, CourseUnitInfo>,
): CalendarRowsResult => {
  const nameFor = (courseUnitId: string | null, fallback: string): string =>
    (courseUnitId ? courseUnits[courseUnitId]?.name : null) ?? fallback;
  return {
    sessions: rows.sessions.map((session) => ({
      ...session,
      courseName: nameFor(session.courseUnitId, session.courseName),
    })),
    courses: rows.courses
      .map((course) => ({ ...course, name: nameFor(course.courseUnitId, course.realisationName) }))
      .sort(compareCourses),
  };
};
