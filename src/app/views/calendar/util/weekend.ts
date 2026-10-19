import type { AllDayItem } from '../types';

export const weekendHasContent = (weekendKeys: string[], blocks: { dateKey: string }[]): boolean =>
  weekendKeys.some((dateKey) => blocks.some((block) => block.dateKey === dateKey));

export const weekendDeadlines = (
  weekendKeys: string[],
  allDay: Record<string, AllDayItem[]>,
): { count: number; firstDateKey: string | null } => {
  const perDay = weekendKeys.map((dateKey) => ({
    dateKey,
    count: (allDay[dateKey] ?? []).filter((item) => item.kind === 'deadline').length,
  }));
  return {
    count: perDay.reduce((sum, day) => sum + day.count, 0),
    firstDateKey: perDay.find((day) => day.count > 0)?.dateKey ?? null,
  };
};
