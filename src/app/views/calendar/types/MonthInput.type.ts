import type { Clash, Holiday, NoteOccurrence, Session } from '@/app/schedule';

export interface MonthInput {
  monthKey: string;
  todayKey: string;
  attended: Session[];
  clashes: Clash[];
  periods: { name: string; startDate: string }[];
  holidays: Holiday[];
  noTeachingWeeks: Set<string>;
  roomChangeIds: Set<string>;
  showCancelled: boolean;
  notes: NoteOccurrence[];
}
