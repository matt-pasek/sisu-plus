import type { CalendarDeadline } from '@/app/api/dataPoints/calendar/types';
import type { Clash, DateRange, Holiday, Session } from '@/app/schedule';

export interface YearInput {
  range: DateRange;
  todayKey: string;
  attended: Session[];
  clashes: Clash[];
  holidays: Holiday[];
  deadlines: CalendarDeadline[];
}
