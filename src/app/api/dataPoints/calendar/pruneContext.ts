import {
  findClashes,
  pairKey,
  seriesKeyOf,
  type Clash,
  type DateRange,
  type PruneContext,
  type Session,
} from '@/app/schedule';
import type { CalendarCourse } from './types';

export const pruneBase = (
  range: DateRange,
  sessions: Session[],
  candidates: Session[],
  clashes: Clash[],
): Omit<PruneContext, 'visibleGroupIds'> => {
  const all = [...sessions, ...candidates];
  const byId = new Map(all.map((session) => [session.id, session]));
  const overlappingPairs = new Set(
    findClashes(sessions).flatMap((clash) => {
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
