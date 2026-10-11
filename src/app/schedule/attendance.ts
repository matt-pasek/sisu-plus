import { uniqueBy } from './collections';
import { seriesKeyOf } from './series';
import type { AttendancePlan, AttendanceResult, AttendanceStatus, ClashSkip, GroupRef, Session } from './types';

export const ALL_DATES = 'all';

type Groups = Map<string, GroupRef>;
type Plans = Record<string, AttendancePlan>;

const byStart = (a: Session, b: Session): number => a.start.getTime() - b.start.getTime();

const overlaps = (a: Session, b: Session): boolean => a.start < b.end && b.start < a.end;

const activeUsual = (group: GroupRef, groups: Groups, plans: Plans): string | null => {
  const usual = plans[group.courseKey]?.usual[group.setId];
  return usual != null && groups.get(usual)?.visible === true ? usual : null;
};

const isAttendedGroup = (group: GroupRef, groups: Groups, plans: Plans): boolean => {
  const usual = activeUsual(group, groups, plans);
  return usual == null || usual === group.id;
};

const visibleOwners = (session: Session, groups: Groups): GroupRef[] =>
  session.groupIds.map((id) => groups.get(id)).filter((group): group is GroupRef => group != null && group.visible);

const baseStatus = (session: Session, groups: Groups, plans: Plans): AttendanceStatus => {
  const owners = visibleOwners(session, groups);
  return owners.length === 0 || owners.some((owner) => isAttendedGroup(owner, groups, plans))
    ? 'attended'
    : 'alternative';
};

const setOf = (session: Session, groups: Groups): string | null =>
  (session.groupId ? groups.get(session.groupId)?.setId : undefined) ?? null;

const keptOutsideSet = (session: Session, setId: string | null, groups: Groups, plans: Plans): boolean =>
  visibleOwners(session, groups).some((owner) => owner.setId !== setId && isAttendedGroup(owner, groups, plans));

const skipApplies = (skip: ClashSkip, session: Session): boolean =>
  seriesKeyOf(session) === skip.skipSeriesKey && (skip.dateKey === ALL_DATES || skip.dateKey === session.dateKey);

export const applyAttendance = (
  sessions: Session[],
  groups: Groups,
  plans: Plans,
  candidates: Session[] = [],
): AttendanceResult => {
  const visible = new Map(sessions.map((session) => [session.id, session]));
  const candidateById = new Map(candidates.map((session) => [session.id, session]));
  const lookup = (id: string): Session | undefined => visible.get(id) ?? candidateById.get(id);

  const usable = Object.values(plans)
    .flatMap((plan) => plan.swaps)
    .filter((swap) => visible.has(swap.fromSessionId));
  const unavailableSwaps = new Set(
    usable.filter((swap) => !lookup(swap.toSessionId)).map((swap) => swap.fromSessionId),
  );
  const resolved = usable.flatMap((swap) => {
    const from = visible.get(swap.fromSessionId);
    const to = lookup(swap.toSessionId);
    return from && to && !to.cancelled ? [{ from, to }] : [];
  });
  const swappedIn = new Set(resolved.map(({ to }) => to.id));
  const swappedOut = new Set(
    resolved
      .filter(({ from, to }) => !keptOutsideSet(from, setOf(to, groups) ?? setOf(from, groups), groups, plans))
      .map(({ from }) => from.id),
  );

  const all = [
    ...sessions,
    ...uniqueBy(
      resolved.map(({ to }) => to).filter((to) => !visible.has(to.id)),
      (session) => session.id,
    ),
  ];
  const afterSwaps = new Map<string, AttendanceStatus>(
    all.map((session) => [
      session.id,
      swappedIn.has(session.id)
        ? 'attended'
        : swappedOut.has(session.id)
          ? 'alternative'
          : baseStatus(session, groups, plans),
    ]),
  );

  const skips = Object.values(plans).flatMap((plan) => plan.skips);
  const attendedAfterSwaps = all.filter((session) => afterSwaps.get(session.id) === 'attended');
  const skippedIds = new Set(
    attendedAfterSwaps
      .filter((session) =>
        skips.some(
          (skip) =>
            skipApplies(skip, session) &&
            attendedAfterSwaps.some(
              (keep) =>
                keep.id !== session.id &&
                !keep.cancelled &&
                seriesKeyOf(keep) === skip.keepSeriesKey &&
                overlaps(keep, session),
            ),
        ),
      )
      .map((session) => session.id),
  );

  const statusById = new Map<string, AttendanceStatus>(
    all.map((session) => [
      session.id,
      skippedIds.has(session.id) ? 'skipped' : (afterSwaps.get(session.id) ?? 'attended'),
    ]),
  );
  const withStatus = (status: AttendanceStatus): Session[] =>
    all.filter((session) => statusById.get(session.id) === status).sort(byStart);

  return {
    attended: withStatus('attended'),
    alternatives: withStatus('alternative'),
    skipped: withStatus('skipped'),
    statusById,
    swappedIn,
    unavailableSwaps,
  };
};
