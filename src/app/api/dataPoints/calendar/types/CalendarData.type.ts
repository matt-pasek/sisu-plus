import type { Clash, DateRange, Session } from '@/app/schedule';
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
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  updatedAt: number;
  refetch: () => void;
}
