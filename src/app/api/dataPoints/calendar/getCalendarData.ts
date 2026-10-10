import { useMemo } from 'react';
import { getUserDetails } from '@/app/api/dataPoints/getUserDetails';
import { fetchCourseUnit } from '@/app/api/endpoints/courseUnit';
import { fetchLocations } from '@/app/api/endpoints/locations';
import { fetchStudyEventsInCalendar } from '@/app/api/endpoints/studyEventsInCalendar';
import { pickLabel } from '@/app/api/resolvers/helpers/pickLabel';
import { useSisuQuery } from '@/app/hooks/useSisuQuery';
import { findClashes, groupClashesBySession, termRangeFor } from '@/app/schedule';
import { mapCalendarRows } from './mapCalendarRows';
import { mapCourseUnits } from './mapCourseUnits';
import { mapLocations } from './mapLocations';
import type { CalendarData, CalendarRowsResult, LabelPicker } from './types';

const FIVE_MINUTES = 5 * 60 * 1000;
const ONE_DAY = 24 * 60 * 60 * 1000;
const EMPTY_ROWS: CalendarRowsResult = { sessions: [], courses: [] };

const pickCalendarLabel: LabelPicker = (value) => (value ? pickLabel(value) : null);

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
    { enabled: locationIds.length > 0, staleTime: ONE_DAY },
  );

  const courseUnitIds = useMemo(
    () => [...new Set(courses.flatMap((course) => (course.courseUnitId ? [course.courseUnitId] : [])))].sort(),
    [courses],
  );
  const courseUnitsQuery = useSisuQuery(
    ['calendar-course-units', courseUnitIds],
    async () => mapCourseUnits(await Promise.all(courseUnitIds.map(fetchCourseUnit)), pickCalendarLabel),
    { enabled: courseUnitIds.length > 0, staleTime: ONE_DAY },
  );

  const clashes = useMemo(() => findClashes(sessions), [sessions]);
  const clashesBySession = useMemo(() => groupClashesBySession(clashes), [clashes]);

  return {
    range,
    sessions,
    courses,
    clashes,
    clashesBySession,
    rooms: roomsQuery.data ?? {},
    courseUnits: courseUnitsQuery.data ?? {},
    isLoading: loadingDetails || rowsQuery.isLoading,
    isFetching: rowsQuery.isFetching,
    error: rowsQuery.error ?? null,
    updatedAt: rowsQuery.dataUpdatedAt,
    refetch: () => {
      void rowsQuery.refetch();
    },
  };
};
