import { useMemo } from 'react';
import { keepPreviousData } from '@tanstack/react-query';
import { getUserDetails } from '@/app/api/dataPoints/getUserDetails';
import { fetchCourseUnit } from '@/app/api/endpoints/courseUnit';
import { fetchLocations } from '@/app/api/endpoints/locations';
import { fetchStudyEventsInCalendar } from '@/app/api/endpoints/studyEventsInCalendar';
import { useSisuQuery } from '@/app/hooks/useSisuQuery';
import { findClashes, groupClashesBySession, termRangeFor } from '@/app/schedule';
import { applyCourseUnitNames } from './applyCourseUnitNames';
import { pickCalendarLabel } from './labels';
import { mapCalendarRows } from './mapCalendarRows';
import { mapCourseUnits } from './mapCourseUnits';
import { mapLocations } from './mapLocations';
import type { CalendarData, CalendarRowsResult, CourseUnitInfo, RoomInfo } from './types';

const FIVE_MINUTES = 5 * 60 * 1000;
const ONE_DAY = 24 * 60 * 60 * 1000;
const EMPTY_ROWS: CalendarRowsResult = { sessions: [], courses: [] };
const EMPTY_ROOMS: Record<string, RoomInfo> = {};
const EMPTY_COURSE_UNITS: Record<string, CourseUnitInfo> = {};

export const getCalendarData = (anchorKey: string): CalendarData => {
  const { startKey, endKey } = termRangeFor(anchorKey);
  const range = useMemo(() => ({ startKey, endKey }), [startKey, endKey]);
  const { userDetails, loadingDetails } = getUserDetails();
  const personId = userDetails?.id ?? null;

  const rowsQuery = useSisuQuery(
    ['calendar-rows', personId, startKey, endKey],
    async () =>
      mapCalendarRows(
        await fetchStudyEventsInCalendar({ personId: personId ?? '', startDate: startKey, endDate: endKey }),
        range,
        pickCalendarLabel,
      ),
    { enabled: personId != null, staleTime: FIVE_MINUTES },
  );
  const { sessions, courses } = rowsQuery.data ?? EMPTY_ROWS;

  const locationIds = useMemo(
    () => [...new Set(sessions.flatMap((session) => session.locationIds))].sort(),
    [sessions],
  );
  const roomsQuery = useSisuQuery(
    ['calendar-rooms', locationIds],
    async () => mapLocations(await fetchLocations(locationIds), pickCalendarLabel),
    { enabled: locationIds.length > 0, staleTime: ONE_DAY, placeholderData: keepPreviousData },
  );

  const courseUnitIds = useMemo(
    () => [...new Set(courses.flatMap((course) => (course.courseUnitId ? [course.courseUnitId] : [])))].sort(),
    [courses],
  );
  const courseUnitsQuery = useSisuQuery(
    ['calendar-course-units', courseUnitIds],
    async () => mapCourseUnits(await Promise.all(courseUnitIds.map(fetchCourseUnit)), pickCalendarLabel),
    { enabled: courseUnitIds.length > 0, staleTime: ONE_DAY, placeholderData: keepPreviousData },
  );
  const rooms = roomsQuery.data ?? EMPTY_ROOMS;
  const courseUnits = courseUnitsQuery.data ?? EMPTY_COURSE_UNITS;
  const named = useMemo(
    () => applyCourseUnitNames(rowsQuery.data ?? EMPTY_ROWS, courseUnits),
    [rowsQuery.data, courseUnits],
  );

  const clashes = useMemo(() => findClashes(sessions), [sessions]);
  const clashesBySession = useMemo(() => groupClashesBySession(clashes), [clashes]);

  return {
    range,
    sessions: named.sessions,
    courses: named.courses,
    clashes,
    clashesBySession,
    rooms,
    courseUnits,
    isLoading: loadingDetails || rowsQuery.isLoading,
    isFetching: rowsQuery.isFetching,
    error: rowsQuery.error ?? null,
    updatedAt: rowsQuery.dataUpdatedAt,
    refetch: () => {
      void rowsQuery.refetch();
    },
  };
};
