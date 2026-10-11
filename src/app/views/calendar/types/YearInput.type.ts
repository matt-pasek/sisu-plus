import type { Clash, DateRange, Holiday, Session } from '@/app/schedule';

export interface YearInput {
  range: DateRange;
  todayKey: string;
  attended: Session[];
  clashes: Clash[];
  holidays: Holiday[];
}
