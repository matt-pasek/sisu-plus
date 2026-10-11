import {
  findClashes,
  pairKey,
  seriesKeyOf,
  type Clash,
  type DateRange,
  type PruneContext,
  type Session,
  uniqueBy,
} from '@/app/schedule';
import type { CalendarCourse, PruneReadiness } from './types';

export const pruneBase = (
  range: DateRange,
  sessions: Session[],
  candidates: Session[],
  clashes: Clash[],
): Omit<PruneContext, 'visibleGroupIds'> => {
  const all = uniqueBy([...sessions, ...candidates], (session) => session.id);
  const byId = new Map(all.map((session) => [session.id, session]));
  const overlappingPairs = new Set(
    findClashes(all).flatMap((clash) => {
      const [a, b] = clash.sessionIds.map((id) => byId.get(id));
      return a && b ? [pairKey(seriesKeyOf(a), seriesKeyOf(b))] : [];
    }),
  );
  return {
    range,
    sessionIds: new Set(all.map((session) => session.id)),
    seriesKeys: new Set(all.map(seriesKeyOf)),
    overlappingPairs,
    clashIds: new Set(clashes.map((clash) => clash.id)),
  };
};

export const visibleGroupIdsOf = (course: CalendarCourse): Set<string> =>
  new Set(course.groupSets.flatMap((set) => set.groups.filter((group) => group.isInCalendar).map((group) => group.id)));

// Pruning against a partial picture deletes rules for sessions that simply have not arrived yet.
export const pruneReady = (readiness: PruneReadiness): boolean =>
  readiness.plansLoaded &&
  readiness.rowsSettled &&
  readiness.candidatesSettled &&
  readiness.extraCoursesSettled &&
  readiness.linksLoaded &&
  readiness.linkedStates.every((state) => state.status === 'ok' || state.status === 'stale');
