import type { CalendarCourse } from '@/app/api/dataPoints/calendar/types';
import { suggestSwap, type Clash, type GroupRef, type Session } from '@/app/schedule';
import type { GroupContext, SwapSuggestionModel } from '../types';

export const clashPartner = (
  session: Session,
  clashesBySession: Map<string, Clash[]>,
  sessionsById: Map<string, Session>,
): Session | null => {
  const [clash] = clashesBySession.get(session.id) ?? [];
  const otherId = clash?.sessionIds.find((id) => id !== session.id);
  return otherId ? (sessionsById.get(otherId) ?? null) : null;
};

export const swapSuggestionFor = (
  session: Session,
  clashesBySession: Map<string, Clash[]>,
  attended: Session[],
  pool: Session[],
  groups: Map<string, GroupRef>,
  dismissed: string[],
): SwapSuggestionModel | null => {
  const found = (clashesBySession.get(session.id) ?? [])
    .filter((clash) => !dismissed.includes(clash.id))
    .map((clash) => ({ clash, swap: suggestSwap(clash, attended, pool, groups) }))
    .find((item) => item.swap != null);
  if (!found?.swap) return null;
  const { swap } = found;
  const target = pool.find((item) => item.id === swap.toSessionId);
  return target ? { swap, target, clashId: found.clash.id } : null;
};

export const groupContext = (session: Session, course: CalendarCourse | undefined): GroupContext | null => {
  if (!course || !session.groupId) return null;
  const set = course.groupSets.find((item) => item.groups.some((group) => group.id === session.groupId));
  const group = set?.groups.find((item) => item.id === session.groupId);
  return set && group ? { set, group } : null;
};

export const groupMenuFor = (session: Session, context: GroupContext): 'switch' | 'hide' | null => {
  if (session.kind === 'lecture') return context.group.hasEntry ? 'hide' : null;
  return context.set.groups.filter((group) => !group.cancelled && group.eventIds.length > 0).length > 1
    ? 'switch'
    : null;
};
