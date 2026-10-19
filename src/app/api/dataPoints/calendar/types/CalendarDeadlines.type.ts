import type { CalendarDeadline } from './CalendarDeadline.type';
import type { DeadlineStatus } from './DeadlineStatus.type';

export interface CalendarDeadlines {
  deadlines: CalendarDeadline[];
  status: DeadlineStatus;
  refetch: () => void;
}
