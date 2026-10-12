import type { CalendarDeadline } from '@/app/api/dataPoints/calendar/types';
import type { AnchorRect } from './AnchorRect.type';

export interface DeadlinePopoverState {
  deadline: CalendarDeadline;
  element: HTMLElement;
  anchor: AnchorRect;
}
