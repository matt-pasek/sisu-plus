import { helsinkiWallTimeToInstant } from '@/app/schedule';
import type { CalendarDeadline } from '../types';

export const buildDeadline = (
  id: string,
  dateKey: string,
  hour: number,
  overrides: Partial<CalendarDeadline> = {},
): CalendarDeadline => ({
  id,
  title: `Deadline ${id}`,
  dueAt: helsinkiWallTimeToInstant(dateKey, Math.round(hour * 60)),
  dateKey,
  courseLabel: null,
  colorIndex: null,
  url: null,
  ...overrides,
});
