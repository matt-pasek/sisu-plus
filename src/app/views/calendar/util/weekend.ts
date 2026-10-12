import type { AllDayItem } from '../types';

export const weekendHasContent = (
  weekendKeys: string[],
  blocks: { dateKey: string }[],
  allDay: Record<string, AllDayItem[]>,
): boolean =>
  weekendKeys.some(
    (dateKey) => blocks.some((block) => block.dateKey === dateKey) || (allDay[dateKey] ?? []).length > 0,
  );
