import type { CalendarGroup, CalendarGroupSet } from '@/app/api/dataPoints/calendar/types';

export interface GroupContext {
  set: CalendarGroupSet;
  group: CalendarGroup;
}
