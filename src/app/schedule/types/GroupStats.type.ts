import type { SessionKind } from './SessionKind.type';

export interface GroupStats {
  total: number;
  clashing: number;
  perSession: { sessionId: string; clashes: boolean }[];
  clashWith: { courseName: string; kind: SessionKind }[];
}
