import type { ShapeSegment } from '@/app/schedule';
import type { MonthException } from './MonthException.type';

export interface MonthCell {
  dateKey: string;
  inMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  minutes: number;
  shape: ShapeSegment[];
  hasClash: boolean;
  exceptions: MonthException[];
}
