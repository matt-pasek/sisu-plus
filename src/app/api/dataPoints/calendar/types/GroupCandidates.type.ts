import type { Session } from '@/app/schedule';

export interface GroupCandidates {
  sessions: Session[];
  isFetching: boolean;
  failed: boolean;
}
