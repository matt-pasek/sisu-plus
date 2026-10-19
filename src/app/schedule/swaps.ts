import { uniqueBy } from './collections';
import { daysBetween, startOfWeekKey } from './time';
import type { Clash, GroupRef, Session, Swap } from './types';

type Groups = Map<string, GroupRef>;

const byStart = (a: Session, b: Session): number => a.start.getTime() - b.start.getTime();

const overlaps = (a: Session, b: Session): boolean => a.start < b.end && b.start < a.end;

const groupOf = (session: Session, groups: Groups): GroupRef | undefined =>
  session.groupId ? groups.get(session.groupId) : undefined;

const sameSet = (a: GroupRef, b: GroupRef): boolean => a.courseKey === b.courseKey && a.setId === b.setId;

const sameWeek = (a: Session, b: Session): boolean => startOfWeekKey(a.dateKey) === startOfWeekKey(b.dateKey);

const dayDistance = (a: Session, b: Session): number => Math.abs(daysBetween(a.dateKey, b.dateKey));

const siblingsInWeek = (session: Session, sessions: Session[], groups: Groups): Session[] => {
  const group = groupOf(session, groups);
  if (!group) return [];
  return sessions.filter((other) => {
    const otherGroup = groupOf(other, groups);
    return (
      otherGroup != null &&
      sameSet(group, otherGroup) &&
      other.groupId !== session.groupId &&
      sameWeek(session, other) &&
      !other.cancelled
    );
  });
};

export const otherTimes = (session: Session, pool: Session[], groups: Groups, attendedIds: Set<string>): Session[] =>
  uniqueBy(
    siblingsInWeek(session, pool, groups).filter((other) => other.id !== session.id && !attendedIds.has(other.id)),
    (other) => other.id,
  ).sort(byStart);

export const nearestSwapTo = (target: Session, attended: Session[], groups: Groups): Swap | null => {
  const [from] = siblingsInWeek(target, attended, groups).sort(
    (a, b) =>
      dayDistance(a, target) - dayDistance(b, target) ||
      Math.abs(a.start.getTime() - target.start.getTime()) - Math.abs(b.start.getTime() - target.start.getTime()),
  );
  return from ? { fromSessionId: from.id, toSessionId: target.id } : null;
};

export const weekSwaps = (target: Session, attended: Session[], pool: Session[], groups: Groups): Swap[] => {
  const froms = siblingsInWeek(target, attended, groups).sort(byStart);
  const tos = uniqueBy(
    pool.filter((other) => other.groupId === target.groupId && sameWeek(other, target) && !other.cancelled),
    (other) => other.id,
  ).sort(byStart);
  return froms.slice(0, tos.length).map((from, index) => ({ fromSessionId: from.id, toSessionId: tos[index].id }));
};

export const suggestSwap = (clash: Clash, attended: Session[], pool: Session[], groups: Groups): Swap | null => {
  const attendedIds = new Set(attended.map((session) => session.id));
  const options = clash.sessionIds
    .map((id) => attended.find((session) => session.id === id))
    .filter((side): side is Session => side != null && side.kind !== 'exam')
    .flatMap((side) => {
      const [free] = otherTimes(side, pool, groups, attendedIds)
        .filter(
          (other) =>
            other.kind !== 'exam' &&
            !attended.some((busy) => busy.id !== side.id && !busy.cancelled && overlaps(busy, other)),
        )
        .sort((a, b) => dayDistance(a, side) - dayDistance(b, side) || byStart(a, b));
      return free
        ? [{ swap: { fromSessionId: side.id, toSessionId: free.id }, distance: dayDistance(free, side) }]
        : [];
    })
    .sort((a, b) => a.distance - b.distance);
  return options[0]?.swap ?? null;
};
