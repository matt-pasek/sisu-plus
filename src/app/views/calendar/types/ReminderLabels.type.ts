import type { SessionKind } from '@/app/schedule';
import type { RoomLabels } from './RoomLabels.type';

export interface ReminderLabels {
  kind: (kind: SessionKind) => string;
  room: RoomLabels;
  date: (dateKey: string) => string;
}
