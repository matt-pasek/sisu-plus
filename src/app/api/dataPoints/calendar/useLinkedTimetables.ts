import { useCallback, useMemo } from 'react';
import { useQueries, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import type { DateRange } from '@/app/schedule';
import { importTimetable, mapLinkedSessions } from './mapLinkedTimetable';
import { CACHE_PREFIX, parseCachedTimetable } from './timetableLinks';
import { requestTimetable } from './timetableMessages';
import { timetableSourceLabel } from './timetableUrl';
import type { CalendarCourse, LinkedTimetables, LinkedTimetableState, LoadedTimetable } from './types';
import { useTimetableLinks } from './useTimetableLinks';

const TWENTY_MINUTES = 20 * 60 * 1000;

const loadTimetable = async (courseKey: string, url: string): Promise<LoadedTimetable> => {
  const cacheKey = `${CACHE_PREFIX}${courseKey}`;
  const result = await requestTimetable(url);
  if (result.ok) {
    const fetchedAt = Date.now();
    await chrome.storage.local.set({ [cacheKey]: { url, text: result.text, fetchedAt } }).catch(() => undefined);
    return { text: result.text, fetchedAt, stale: false, reason: null };
  }
  const stored: Record<string, unknown> = await chrome.storage.local.get(cacheKey).catch(() => ({}));
  const cached = parseCachedTimetable(stored[cacheKey]);
  return cached && cached.url === url
    ? { text: cached.text, fetchedAt: cached.fetchedAt, stale: true, reason: result.reason }
    : { text: null, fetchedAt: null, stale: false, reason: result.reason };
};

const toLoadStates = (results: UseQueryResult<LoadedTimetable>[]) =>
  results.map((result) => ({ data: result.data, isLoading: result.isLoading }));

export const useLinkedTimetables = (courses: CalendarCourse[], range: DateRange): LinkedTimetables => {
  const queryClient = useQueryClient();
  const { links, saveLink, removeLink } = useTimetableLinks();
  const entries = useMemo(
    () =>
      courses.flatMap((course) => {
        const link = links[course.realisationId];
        return link ? [{ course, link }] : [];
      }),
    [courses, links],
  );
  const loads = useQueries({
    queries: entries.map(({ course, link }) => ({
      queryKey: ['linked-timetable', course.realisationId, link.url],
      queryFn: () => loadTimetable(course.realisationId, link.url),
      staleTime: TWENTY_MINUTES,
    })),
    combine: toLoadStates,
  });

  const { sessions, states } = useMemo(() => {
    const mapped = entries.map(({ course, link }, index) => {
      const load = loads[index];
      const imported = load?.data?.text ? importTimetable(load.data.text, link.codeFilter) : null;
      const courseSessions = imported ? mapLinkedSessions(course, imported, range) : [];
      const status: LinkedTimetableState['status'] =
        !load || load.isLoading ? 'loading' : !imported ? 'error' : load.data?.stale ? 'stale' : 'ok';
      const state: LinkedTimetableState = {
        url: link.url,
        label: timetableSourceLabel(link.url),
        status,
        reason: load?.data?.reason ?? (load && !load.isLoading && !imported ? 'notCalendar' : null),
        fetchedAt: load?.data?.fetchedAt ?? null,
        count: courseSessions.length,
      };
      return { courseKey: course.realisationId, courseSessions, state };
    });
    return {
      sessions: mapped.flatMap((entry) => entry.courseSessions),
      states: Object.fromEntries(mapped.map((entry) => [entry.courseKey, entry.state])),
    };
  }, [entries, loads, range]);

  const refresh = useCallback(
    (courseKey: string) => void queryClient.invalidateQueries({ queryKey: ['linked-timetable', courseKey] }),
    [queryClient],
  );

  return { sessions, states, saveLink, removeLink, refresh };
};
