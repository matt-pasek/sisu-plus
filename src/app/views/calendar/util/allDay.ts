import type { CalendarDeadline } from '@/app/api/dataPoints/calendar/types';
import type { AllDayInput, AllDayItem } from '../types';

export const ALL_DAY_LIMIT = 3;

const byDue = (a: CalendarDeadline, b: CalendarDeadline): number => a.dueAt.getTime() - b.dueAt.getTime();

export const allDayItems = (dateKey: string, input: AllDayInput): AllDayItem[] => [
  ...input.holidays
    .filter((holiday) => holiday.dateKey === dateKey)
    .map((holiday): AllDayItem => ({ kind: 'holiday', holiday })),
  ...input.periods
    .filter((period) => period.startDate === dateKey)
    .map((period): AllDayItem => ({ kind: 'periodStart', name: period.name })),
  ...input.deadlines
    .filter((deadline) => deadline.dateKey === dateKey)
    .sort(byDue)
    .map((deadline): AllDayItem => ({ kind: 'deadline', deadline })),
];

export const allDayByDay = (dayKeys: string[], input: AllDayInput): Record<string, AllDayItem[]> =>
  Object.fromEntries(dayKeys.map((dateKey) => [dateKey, allDayItems(dateKey, input)]));

export const allDayLimit = (dayCount: number): number => (dayCount === 1 ? Infinity : ALL_DAY_LIMIT);

export const splitAllDay = (items: AllDayItem[], limit = ALL_DAY_LIMIT): { shown: AllDayItem[]; hidden: number } => ({
  shown: items.slice(0, limit),
  hidden: Math.max(items.length - limit, 0),
});
