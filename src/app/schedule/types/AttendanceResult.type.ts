import type { AttendanceStatus } from './AttendanceStatus.type';
import type { Session } from './Session.type';

export interface AttendanceResult {
  attended: Session[];
  alternatives: Session[];
  skipped: Session[];
  statusById: Map<string, AttendanceStatus>;
  swappedIn: Set<string>;
  unavailableSwaps: Set<string>;
}
