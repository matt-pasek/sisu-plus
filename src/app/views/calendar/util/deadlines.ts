import type { CalendarDeadline } from '@/app/api/dataPoints/calendar/types';
import { daysBetween } from '@/app/schedule';
import { getModuleColorValueByIndex } from '@/app/theme/moduleColors';

const DAY_MS = 86_400_000;

export const NEUTRAL_DEADLINE_COLOR = '#8b8ba7';

export const deadlineColor = (deadline: CalendarDeadline): string =>
  deadline.colorIndex == null ? NEUTRAL_DEADLINE_COLOR : getModuleColorValueByIndex(deadline.colorIndex);

export const dueSoon = (deadlines: CalendarDeadline[], now: Date, days = 7, limit = 5): CalendarDeadline[] =>
  deadlines
    .filter((deadline) => deadline.dueAt > now && deadline.dueAt.getTime() <= now.getTime() + days * DAY_MS)
    .sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime())
    .slice(0, limit);

export const dueRelative = (
  dateKey: string,
  todayKey: string,
): { kind: 'today' } | { kind: 'tomorrow' } | { kind: 'days'; count: number } => {
  const count = daysBetween(todayKey, dateKey);
  if (count <= 0) return { kind: 'today' };
  if (count === 1) return { kind: 'tomorrow' };
  return { kind: 'days', count };
};
