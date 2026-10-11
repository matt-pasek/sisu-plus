import { useMemo } from 'react';
import { fetchCourseUnitRealisations } from '@/app/api/endpoints/courseUnitRealisations';
import { fetchEnrolments } from '@/app/api/endpoints/enrolments';
import { useSisuQuery } from '@/app/hooks/useSisuQuery';
import type { DateRange } from '@/app/schedule';
import { pickCalendarLabel } from './labels';
import { mapCalendarRows } from './mapCalendarRows';
import { timelessRealisationIds, timelessRows } from './timelessCourses';
import type { CalendarCourse } from './types';

const ONE_DAY = 24 * 60 * 60 * 1000;
const NO_COURSES: CalendarCourse[] = [];

export const useTimelessCourses = (shown: CalendarCourse[] | undefined, range: DateRange): CalendarCourse[] => {
  const enrolmentsQuery = useSisuQuery(['enrolments'], fetchEnrolments);
  const enrolments = enrolmentsQuery.data;
  const knownKeys = useMemo(() => new Set((shown ?? []).map((course) => course.realisationId)), [shown]);
  const ids = useMemo(
    () => (shown && enrolments ? timelessRealisationIds(enrolments, knownKeys) : []),
    [shown, enrolments, knownKeys],
  );
  const query = useSisuQuery(
    ['calendar-timeless', ids, range.startKey, range.endKey],
    async () => {
      const realisations = await fetchCourseUnitRealisations(ids);
      const rows = timelessRows(enrolments ?? [], realisations, knownKeys, range);
      return mapCalendarRows(rows, range, pickCalendarLabel).courses;
    },
    { enabled: ids.length > 0, staleTime: ONE_DAY },
  );
  return query.data ?? NO_COURSES;
};
