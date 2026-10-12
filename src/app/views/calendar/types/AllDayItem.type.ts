import type { CalendarDeadline } from '@/app/api/dataPoints/calendar/types';
import type { Holiday } from '@/app/schedule';

export type AllDayItem =
  | { kind: 'holiday'; holiday: Holiday }
  | { kind: 'periodStart'; name: string }
  | { kind: 'deadline'; deadline: CalendarDeadline };
