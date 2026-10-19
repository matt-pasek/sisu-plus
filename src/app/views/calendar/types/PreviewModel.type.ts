import type { Session } from '@/app/schedule';

export interface PreviewModel {
  sessions: Session[];
  clashIds: Set<string>;
}
