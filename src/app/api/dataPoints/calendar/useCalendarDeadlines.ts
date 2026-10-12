import { useMemo } from 'react';
import type { DateRange } from '@/app/schedule';
import { getMoodleDeadlines } from '../getMoodleDeadlines';
import { deadlineCourses, toCalendarDeadlines } from './deadlines';
import type { CalendarCourse, CalendarDeadlines, CourseUnitInfo, DeadlineStatus } from './types';

export const useCalendarDeadlines = (
  courses: CalendarCourse[],
  courseUnits: Record<string, CourseUnitInfo>,
  range: DateRange,
): CalendarDeadlines => {
  const {
    deadlines: calendar,
    deadlinesLoading,
    missingToken,
    deadlinesError,
    refetchDeadlines,
  } = getMoodleDeadlines();
  const matchable = useMemo(() => deadlineCourses(courses, courseUnits), [courses, courseUnits]);
  const deadlines = useMemo(
    () => toCalendarDeadlines(calendar?.events ?? [], matchable, range),
    [calendar, matchable, range],
  );
  const status: DeadlineStatus = missingToken
    ? 'missingToken'
    : deadlinesError
      ? 'failed'
      : deadlinesLoading
        ? 'loading'
        : 'ready';
  return { deadlines, status, refetch: refetchDeadlines };
};
