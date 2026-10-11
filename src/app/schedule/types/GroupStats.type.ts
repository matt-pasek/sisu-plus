export interface GroupStats {
  total: number;
  clashing: number;
  perSession: { sessionId: string; clashes: boolean }[];
  clashCourseNames: string[];
}
