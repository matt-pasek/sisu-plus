import type { Session } from '@/app/schedule';

export interface NextClassModel {
  session: Session;
  laterToday: Session[];
}
