import type { MonthCell } from './MonthCell.type';

export interface MonthWeek {
  weekKey: string;
  weekNumber: number;
  isCurrent: boolean;
  cells: MonthCell[];
}
