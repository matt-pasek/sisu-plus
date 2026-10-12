import type { RecurrenceRule } from '@/app/schedule';

export interface NoteDraft {
  title: string;
  dateKey: string;
  startMinutes: number;
  endMinutes: number;
  repeat: RecurrenceRule;
  untilKey: string;
}
