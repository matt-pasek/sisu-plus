import type { Session } from '@/app/schedule';

export interface AgendaModel {
  next: Session | null;
  nextKnown: boolean;
  day: Session[];
  following: Session | null;
}
