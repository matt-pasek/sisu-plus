import { useMemo } from 'react';
import { fetchCourseUnitRealisations } from '@/app/api/endpoints/courseUnitRealisations';
import { fetchEnrolments } from '@/app/api/endpoints/enrolments';
import { useSisuQuery } from '@/app/hooks/useSisuQuery';
import type { DateRange } from '@/app/schedule';
import { pickCalendarLabel } from './labels';
import { mapCalendarRows } from './mapCalendarRows';
import { activeRealisationIds, omittedRows } from './omittedCourses';
import type { CalendarCourse } from './types';

const ONE_DAY = 24 * 60 * 60 * 1000;
const NO_COURSES: CalendarCourse[] = [];
const NO_IDS: string[] = [];

export const useOmittedCourses = (
  shown: CalendarCourse[] | undefined,
  range: DateRange,
): { courses: CalendarCourse[]; settled: boolean } => {
  const enrolmentsQuery = useSisuQuery(['enrolments'], fetchEnrolments);
  const enrolments = enrolmentsQuery.data;
  const ids = useMemo(() => (enrolments ? activeRealisationIds(enrolments) : NO_IDS), [enrolments]);
  const realisationsQuery = useSisuQuery(['calendar-realisations', ids], () => fetchCourseUnitRealisations(ids), {
    enabled: ids.length > 0,
    staleTime: ONE_DAY,
  });
  const realisations = realisationsQuery.data;
  const courses = useMemo(() => {
    if (!shown || !enrolments || !realisations) return NO_COURSES;
    const knownKeys = new Set(shown.map((course) => course.realisationId));
    return mapCalendarRows(omittedRows(enrolments, realisations, knownKeys, range), range, pickCalendarLabel).courses;
  }, [shown, enrolments, realisations, range]);
  const settled = shown != null && enrolmentsQuery.isSuccess && (ids.length === 0 || realisationsQuery.isSuccess);
  return { courses, settled };
};
