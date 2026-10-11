import type { YearDay } from './YearDay.type';

export interface YearWeek {
  weekKey: string;
  weekNumber: number;
  isCurrent: boolean;
  days: YearDay[];
}
