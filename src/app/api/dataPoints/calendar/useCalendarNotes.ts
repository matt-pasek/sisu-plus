import { useCallback, useMemo } from 'react';
import { fetchCalendarEvents } from '@/app/api/endpoints/calendarEvents';
import type { CalendarEvent } from '@/app/api/generated/IlmoApi';
import { useSisuQuery } from '@/app/hooks/useSisuQuery';
import type { DateRange } from '@/app/schedule';
import { NOTES_KEY } from './noteCache';
import { mapNotes } from './notes';
import type { CalendarNotes } from './types';

const FIVE_MINUTES = 5 * 60 * 1000;
const NO_EVENTS: CalendarEvent[] = [];

export const useCalendarNotes = (range: DateRange): CalendarNotes => {
  const query = useSisuQuery(
    [...NOTES_KEY, range.startKey, range.endKey],
    () => fetchCalendarEvents(range.startKey, range.endKey),
    { staleTime: FIVE_MINUTES },
  );
  const events = query.data ?? NO_EVENTS;
  const notes = useMemo(() => mapNotes(events, range), [events, range]);
  const { refetch: refetchQuery } = query;
  const refetch = useCallback(() => {
    void refetchQuery();
  }, [refetchQuery]);
  return { events, notes, isLoading: query.isLoading, isError: query.isError, refetch };
};
