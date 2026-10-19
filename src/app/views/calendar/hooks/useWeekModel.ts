import { useMemo } from 'react';
import type { CalendarData } from '@/app/api/dataPoints/calendar/types';
import { addDaysToDateKey, uniqueBy, type Session } from '@/app/schedule';
import type { WeekModel } from '../types';
import { sessionBadges, sessionsInRange } from '../util';

const byStart = (a: Session, b: Session): number => a.start.getTime() - b.start.getTime();

export const useWeekModel = (data: CalendarData, weekKeys: string[], showCancelled: boolean): WeekModel => {
  const startKey = weekKeys[0];
  const endKey = addDaysToDateKey(weekKeys[6], 1);
  const weekSessions = useMemo(
    () =>
      sessionsInRange([...data.attended, ...data.skipped], startKey, endKey)
        .filter((session) => showCancelled || !session.cancelled)
        .sort(byStart),
    [data.attended, data.skipped, startKey, endKey, showCancelled],
  );
  const weekAlternatives = useMemo(
    () => sessionsInRange(data.alternatives, startKey, endKey).filter((session) => !session.cancelled),
    [data.alternatives, startKey, endKey],
  );
  const weekSessionIds = useMemo(() => new Set(weekSessions.map((session) => session.id)), [weekSessions]);
  const weekClashes = useMemo(
    () => data.clashes.filter((clash) => clash.sessionIds.some((id) => weekSessionIds.has(id))),
    [data.clashes, weekSessionIds],
  );
  const badges = useMemo(
    () => sessionBadges(data.skipped, data.swappedIn, data.unavailableSwaps),
    [data.skipped, data.swappedIn, data.unavailableSwaps],
  );
  const knownSessions = useMemo(
    () => uniqueBy([...data.sessions, ...data.attended], (session) => session.id),
    [data.sessions, data.attended],
  );
  const sessionsById = useMemo(() => new Map(knownSessions.map((session) => [session.id, session])), [knownSessions]);
  return { weekSessions, weekAlternatives, weekClashes, weekSessionIds, badges, knownSessions, sessionsById };
};
