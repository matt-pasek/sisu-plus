import type { CalendarDeadline } from '@/app/api/dataPoints/calendar/types';
import type { Holiday } from '@/app/schedule';

export interface AllDayInput {
  holidays: Holiday[];
  periods: { name: string; startDate: string }[];
  deadlines: CalendarDeadline[];
}
