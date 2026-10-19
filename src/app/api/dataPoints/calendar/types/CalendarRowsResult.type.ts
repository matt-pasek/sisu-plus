import type { Session } from '@/app/schedule';
import type { CalendarCourse } from './CalendarCourse.type';

export interface CalendarRowsResult {
  sessions: Session[];
  courses: CalendarCourse[];
}
