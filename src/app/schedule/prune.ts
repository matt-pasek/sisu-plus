import { ALL_DATES } from './attendance';
import type { AttendancePlan, ClashSkip, DateRange, PruneContext, Swap } from './types';

const SESSION_DATE = /@(\d{4}-\d{2}-\d{2})#\d+$/;

export const sessionDateKey = (sessionId: string): string | null => sessionId.match(SESSION_DATE)?.[1] ?? null;

export const pairKey = (a: string, b: string): string => [a, b].sort().join('|');

const inRange = (dateKey: string | null, range: DateRange): boolean =>
  dateKey != null && dateKey >= range.startKey && dateKey < range.endKey;

const keepSwap = (swap: Swap, context: PruneContext): boolean =>
  !inRange(sessionDateKey(swap.fromSessionId), context.range) ||
  (context.sessionIds.has(swap.fromSessionId) && context.sessionIds.has(swap.toSessionId));

const keepSkip = (skip: ClashSkip, context: PruneContext): boolean => {
  const everyTime = skip.dateKey === ALL_DATES;
  if (!everyTime && !inRange(skip.dateKey, context.range)) return true;
  const bothHere = context.seriesKeys.has(skip.keepSeriesKey) && context.seriesKeys.has(skip.skipSeriesKey);
  if (!bothHere) return everyTime;
  return context.overlappingPairs.has(pairKey(skip.keepSeriesKey, skip.skipSeriesKey));
};

const keepDismissal = (id: string, context: PruneContext): boolean => {
  const sessionIds = id.split('|');
  if (sessionIds.length !== 2) return true;
  return (
    !sessionIds.every((sessionId) => inRange(sessionDateKey(sessionId), context.range)) || context.clashIds.has(id)
  );
};

export const prunePlan = (plan: AttendancePlan, context: PruneContext): AttendancePlan => ({
  usual: Object.fromEntries(Object.entries(plan.usual).filter(([, groupId]) => context.visibleGroupIds.has(groupId))),
  swaps: plan.swaps.filter((swap) => keepSwap(swap, context)),
  skips: plan.skips.filter((skip) => keepSkip(skip, context)),
  dismissed: plan.dismissed.filter((id) => keepDismissal(id, context)),
});
