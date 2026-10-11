import { useMemo } from 'react';
import { keepPreviousData } from '@tanstack/react-query';
import { fetchStudyEvents } from '@/app/api/endpoints/studyEvents';
import { useSisuQuery } from '@/app/hooks/useSisuQuery';
import type { DateRange } from '@/app/schedule';
import { pickCalendarLabel } from './labels';
import { mapCandidateSessions } from './mapCandidates';
import type { CalendarCourse, GroupCandidates, StudyEventLike } from './types';

const ONE_DAY = 24 * 60 * 60 * 1000;
const NO_EVENTS: StudyEventLike[] = [];

export const useGroupCandidates = (
  courses: CalendarCourse[],
  courseKeys: string[],
  range: DateRange,
): GroupCandidates => {
  const wanted = useMemo(
    () => courses.filter((course) => courseKeys.includes(course.realisationId)),
    [courses, courseKeys],
  );
  const eventIds = useMemo(
    () =>
      [
        ...new Set(
          wanted.flatMap((course) => course.groupSets.flatMap((set) => set.groups.flatMap((g) => g.eventIds))),
        ),
      ].sort(),
    [wanted],
  );
  const query = useSisuQuery(['calendar-candidates', eventIds], () => fetchStudyEvents(eventIds), {
    enabled: eventIds.length > 0,
    staleTime: ONE_DAY,
    placeholderData: keepPreviousData,
  });
  const events: StudyEventLike[] = query.data ?? NO_EVENTS;
  const sessions = useMemo(
    () => wanted.flatMap((course) => mapCandidateSessions(course, events, range, pickCalendarLabel)),
    [wanted, events, range],
  );
  return { sessions, isFetching: query.isFetching, failed: query.isError };
};
