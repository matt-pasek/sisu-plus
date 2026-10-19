import type { Holiday } from '@/app/schedule';
import type { LoadLevel } from './LoadLevel.type';

export interface YearDay {
  dateKey: string;
  inYear: boolean;
  minutes: number;
  level: LoadLevel;
  exam: boolean;
  clash: boolean;
  holiday: Holiday | null;
  isToday: boolean;
  deadlines: number;
}
