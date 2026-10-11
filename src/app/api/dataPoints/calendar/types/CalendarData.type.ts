import type { AttendancePlan, AttendanceStatus, Clash, DateRange, GroupRef, Session } from '@/app/schedule';
import type { CalendarCourse } from './CalendarCourse.type';
import type { CourseUnitInfo } from './CourseUnitInfo.type';
import type { RoomInfo } from './RoomInfo.type';

export interface CalendarData {
  range: DateRange;
  sessions: Session[];
  courses: CalendarCourse[];
  clashes: Clash[];
  clashesBySession: Map<string, Clash[]>;
  rooms: Record<string, RoomInfo>;
  courseUnits: Record<string, CourseUnitInfo>;
  attended: Session[];
  alternatives: Session[];
  skipped: Session[];
  statusById: Map<string, AttendanceStatus>;
  swappedIn: Set<string>;
  unavailableSwaps: Set<string>;
  candidates: Session[];
  candidatesLoading: boolean;
  candidatesFailed: boolean;
  pool: Session[];
  groups: Map<string, GroupRef>;
  plans: Record<string, AttendancePlan>;
  updatePlan: (courseKey: string, update: (plan: AttendancePlan) => AttendancePlan) => void;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  updatedAt: number;
  refetch: () => void;
}
