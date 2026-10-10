import type { Session } from './Session.type';

export interface SeriesClashSummary {
  total: number;
  clashing: number;
  perSession: { sessionId: string; clashes: boolean }[];
  otherSessions: Session[];
}
