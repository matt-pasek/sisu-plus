import type { Session } from '@/app/schedule';

export interface AgendaModel {
  next: Session | null;
  day: Session[];
  following: Session | null;
}
