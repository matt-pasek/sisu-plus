export interface CalendarGroup {
  id: string;
  name: string | null;
  setId: string;
  eventIds: string[];
  isInCalendar: boolean;
  hasEntry: boolean;
  cancelled: boolean;
}
