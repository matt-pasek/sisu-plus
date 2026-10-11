import { useEffect, useMemo } from 'react';
import { keepPreviousData } from '@tanstack/react-query';
import { getUserDetails } from '@/app/api/dataPoints/getUserDetails';
import { fetchCourseUnit } from '@/app/api/endpoints/courseUnit';
import { fetchLocations } from '@/app/api/endpoints/locations';
import { fetchStudyEventsInCalendar } from '@/app/api/endpoints/studyEventsInCalendar';
import { useSisuQuery } from '@/app/hooks/useSisuQuery';
import { applyAttendance, findClashes, groupClashesBySession, prunePlan, termRangeFor, uniqueBy } from '@/app/schedule';
import { applyCourseUnitNames } from './applyCourseUnitNames';
import { samePlan } from './attendancePlan';
import { candidateCourseKeys } from './candidateCourseKeys';
import { groupIndex, toGroupRefs } from './groupRefs';
import { pickCalendarLabel } from './labels';
import { mapCalendarRows } from './mapCalendarRows';
import { mapCourseUnits } from './mapCourseUnits';
import { mapLocations } from './mapLocations';
import { pruneBase, visibleGroupIdsOf } from './pruneContext';
import { coursesWithoutTimes } from './timetableLinks';
import type { CalendarData, CalendarDataOptions, CalendarRowsResult, CourseUnitInfo, RoomInfo } from './types';
import { useAttendancePlans } from './useAttendancePlans';
import { useGroupCandidates } from './useGroupCandidates';
import { useLinkedTimetables } from './useLinkedTimetables';
import { useTimelessCourses } from './useTimelessCourses';

const FIVE_MINUTES = 5 * 60 * 1000;
const ONE_DAY = 24 * 60 * 60 * 1000;
const EMPTY_ROWS: CalendarRowsResult = { sessions: [], courses: [] };
const EMPTY_ROOMS: Record<string, RoomInfo> = {};
const EMPTY_COURSE_UNITS: Record<string, CourseUnitInfo> = {};

export const getCalendarData = (anchorKey: string, options: CalendarDataOptions): CalendarData => {
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
  const timeless = useTimelessCourses(rowsQuery.data?.courses, range);
  const rows = useMemo(() => {
    const base = rowsQuery.data ?? EMPTY_ROWS;
    return timeless.length > 0 ? { sessions: base.sessions, courses: [...base.courses, ...timeless] } : base;
  }, [rowsQuery.data, timeless]);

  const courseUnitIds = useMemo(
    () => [...new Set(rows.courses.flatMap((course) => (course.courseUnitId ? [course.courseUnitId] : [])))].sort(),
    [rows.courses],
  );
  const courseUnitsQuery = useSisuQuery(
    ['calendar-course-units', courseUnitIds],
    async () => mapCourseUnits(await Promise.all(courseUnitIds.map(fetchCourseUnit)), pickCalendarLabel),
    { enabled: courseUnitIds.length > 0, staleTime: ONE_DAY, placeholderData: keepPreviousData },
  );
  const courseUnits = courseUnitsQuery.data ?? EMPTY_COURSE_UNITS;
  const named = useMemo(() => applyCourseUnitNames(rows, courseUnits), [rows, courseUnits]);
  const linked = useLinkedTimetables(named.courses, range);
  const sessions = useMemo(
    () => [...named.sessions, ...linked.sessions].sort((a, b) => a.start.getTime() - b.start.getTime()),
    [named.sessions, linked.sessions],
  );
  const noTimesCourseKeys = useMemo(
    () => coursesWithoutTimes(named.courses, named.sessions),
    [named.courses, named.sessions],
  );

  const { plans, isLoaded: plansLoaded, updatePlan } = useAttendancePlans(options.onPlanWriteError);
  const groups = useMemo(() => groupIndex(toGroupRefs(named.courses)), [named.courses]);
  const firstPass = useMemo(() => applyAttendance(sessions, groups, plans), [sessions, groups, plans]);
  const firstClashes = useMemo(() => findClashes(firstPass.attended), [firstPass.attended]);
  const courseKeys = useMemo(
    () => candidateCourseKeys(named.courses, plans, firstPass.attended, firstClashes, options.candidateCourseKeys),
    [named.courses, plans, firstPass.attended, firstClashes, options.candidateCourseKeys],
  );
  const candidates = useGroupCandidates(named.courses, courseKeys, range);

  // Candidate groups are not switched on, so their rooms are not among the visible sessions' rooms.
  const locationIds = useMemo(
    () => [...new Set([...rows.sessions, ...candidates.sessions].flatMap((session) => session.locationIds))].sort(),
    [rows.sessions, candidates.sessions],
  );
  const roomsQuery = useSisuQuery(
    ['calendar-rooms', locationIds],
    async () => mapLocations(await fetchLocations(locationIds), pickCalendarLabel),
    { enabled: locationIds.length > 0, staleTime: ONE_DAY, placeholderData: keepPreviousData },
  );
  const rooms = roomsQuery.data ?? EMPTY_ROOMS;

  const attendance = useMemo(
    () => applyAttendance(sessions, groups, plans, candidates.sessions),
    [sessions, groups, plans, candidates.sessions],
  );
  const clashes = useMemo(() => findClashes(attendance.attended), [attendance.attended]);
  const clashesBySession = useMemo(() => groupClashesBySession(clashes), [clashes]);
  const pool = useMemo(
    () =>
      uniqueBy([...attendance.alternatives, ...candidates.sessions], (session) => `${session.id}|${session.groupId}`),
    [attendance.alternatives, candidates.sessions],
  );

  const canPrune =
    plansLoaded && rowsQuery.isSuccess && !rowsQuery.isFetching && !candidates.isFetching && !candidates.failed;
  useEffect(() => {
    if (!canPrune) return;
    const base = pruneBase(range, sessions, candidates.sessions, clashes);
    named.courses
      .filter((course) => course.isInCalendar && plans[course.realisationId])
      .forEach((course) => {
        const plan = plans[course.realisationId];
        const next = prunePlan(plan, { ...base, visibleGroupIds: visibleGroupIdsOf(course) });
        if (!samePlan(plan, next)) updatePlan(course.realisationId, () => next);
      });
  }, [canPrune, range, named.courses, sessions, candidates.sessions, clashes, plans, updatePlan]);

  return {
    range,
    sessions,
    courses: named.courses,
    clashes,
    clashesBySession,
    rooms,
    courseUnits,
    attended: attendance.attended,
    alternatives: attendance.alternatives,
    skipped: attendance.skipped,
    statusById: attendance.statusById,
    swappedIn: attendance.swappedIn,
    unavailableSwaps: attendance.unavailableSwaps,
    candidates: candidates.sessions,
    candidatesLoading: candidates.isFetching,
    candidatesFailed: candidates.failed,
    retryCandidates: candidates.retry,
    pool,
    groups,
    plans,
    updatePlan,
    linked: linked.states,
    noTimesCourseKeys,
    saveTimetable: linked.saveLink,
    removeTimetable: linked.removeLink,
    refreshTimetable: linked.refresh,
    isLoading: loadingDetails || rowsQuery.isLoading,
    isFetching: rowsQuery.isFetching,
    error: rowsQuery.error ?? null,
    updatedAt: rowsQuery.dataUpdatedAt,
    refetch: () => {
      void rowsQuery.refetch();
    },
  };
};
