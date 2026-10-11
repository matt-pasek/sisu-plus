import { ALL_DATES, type AttendancePlan, type ClashSkip, type Swap } from '@/app/schedule';

export const PLAN_KEY_PREFIX = 'calendarAttendance:';

export const EMPTY_PLAN: AttendancePlan = { usual: {}, swaps: [], skips: [], dismissed: [] };

export const planKey = (courseKey: string): string => `${PLAN_KEY_PREFIX}${courseKey}`;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isString = (value: unknown): value is string => typeof value === 'string';

const isSwap = (value: unknown): value is Swap =>
  isRecord(value) && isString(value.fromSessionId) && isString(value.toSessionId);

const isSkip = (value: unknown): value is ClashSkip =>
  isRecord(value) && isString(value.keepSeriesKey) && isString(value.skipSeriesKey) && isString(value.dateKey);

const listOf = <T>(value: unknown, guard: (item: unknown) => item is T): T[] =>
  Array.isArray(value) ? value.filter(guard) : [];

export const parsePlan = (value: unknown): AttendancePlan => {
  if (!isRecord(value)) return EMPTY_PLAN;
  const usual = isRecord(value.usual)
    ? Object.fromEntries(Object.entries(value.usual).filter((entry): entry is [string, string] => isString(entry[1])))
    : {};
  return {
    usual,
    swaps: listOf(value.swaps, isSwap),
    skips: listOf(value.skips, isSkip),
    dismissed: listOf(value.dismissed, isString),
  };
};

export const parsePlans = (items: Record<string, unknown>): Record<string, AttendancePlan> =>
  Object.fromEntries(
    Object.entries(items)
      .filter(([key]) => key.startsWith(PLAN_KEY_PREFIX))
      .map(([key, value]) => [key.slice(PLAN_KEY_PREFIX.length), parsePlan(value)]),
  );

const touches = (swap: Swap, sessionId: string): boolean =>
  swap.fromSessionId === sessionId || swap.toSessionId === sessionId;

export const withSwap = (plan: AttendancePlan, swap: Swap): AttendancePlan => ({
  ...plan,
  swaps: [
    ...plan.swaps.filter((existing) => !touches(existing, swap.fromSessionId) && !touches(existing, swap.toSessionId)),
    swap,
  ],
});

export const withSwaps = (plan: AttendancePlan, swaps: Swap[]): AttendancePlan => swaps.reduce(withSwap, plan);

export const withoutSwap = (plan: AttendancePlan, sessionId: string): AttendancePlan => ({
  ...plan,
  swaps: plan.swaps.filter((swap) => !touches(swap, sessionId)),
});

export const withUsual = (plan: AttendancePlan, setId: string, groupId: string | null): AttendancePlan => ({
  ...plan,
  usual: groupId
    ? { ...plan.usual, [setId]: groupId }
    : Object.fromEntries(Object.entries(plan.usual).filter(([key]) => key !== setId)),
});

const samePair = (a: ClashSkip, b: ClashSkip): boolean =>
  a.dateKey === b.dateKey &&
  [a.keepSeriesKey, a.skipSeriesKey].sort().join('|') === [b.keepSeriesKey, b.skipSeriesKey].sort().join('|');

export const withSkip = (plan: AttendancePlan, skip: ClashSkip): AttendancePlan => ({
  ...plan,
  skips: [...plan.skips.filter((existing) => !samePair(existing, skip)), skip],
});

export const withoutSkip = (plan: AttendancePlan, skipSeriesKey: string, dateKey: string): AttendancePlan => ({
  ...plan,
  skips: plan.skips.filter(
    (skip) => !(skip.skipSeriesKey === skipSeriesKey && (skip.dateKey === dateKey || skip.dateKey === ALL_DATES)),
  ),
});

export const withDismissed = (plan: AttendancePlan, id: string): AttendancePlan =>
  plan.dismissed.includes(id) ? plan : { ...plan, dismissed: [...plan.dismissed, id] };

export const isEmptyPlan = (plan: AttendancePlan): boolean =>
  Object.keys(plan.usual).length === 0 &&
  plan.swaps.length === 0 &&
  plan.skips.length === 0 &&
  plan.dismissed.length === 0;

export const samePlan = (a: AttendancePlan, b: AttendancePlan): boolean => JSON.stringify(a) === JSON.stringify(b);
