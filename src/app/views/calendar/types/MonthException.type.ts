import type { CalendarDeadline } from '@/app/api/dataPoints/calendar/types';
import type { Clash, Holiday, NoteOccurrence, Session } from '@/app/schedule';

export type MonthException =
  | { kind: 'exam'; session: Session }
  | { kind: 'cancelled'; session: Session }
  | { kind: 'roomChange'; session: Session }
  | { kind: 'clash'; clash: Clash }
  | { kind: 'periodStart'; name: string }
  | { kind: 'holiday'; holiday: Holiday }
  | { kind: 'noTeaching' }
  | { kind: 'note'; note: NoteOccurrence }
  | { kind: 'deadline'; deadline: CalendarDeadline };
