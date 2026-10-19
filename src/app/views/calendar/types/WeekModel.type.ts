import type { Clash, Session } from '@/app/schedule';
import type { SessionBadge } from './SessionBadge.type';

export interface WeekModel {
  weekSessions: Session[];
  weekAlternatives: Session[];
  weekClashes: Clash[];
  weekSessionIds: Set<string>;
  badges: Map<string, SessionBadge>;
  knownSessions: Session[];
  sessionsById: Map<string, Session>;
}
