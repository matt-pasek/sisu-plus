import type { CalendarGroup } from './CalendarGroup.type';

export interface CalendarGroupSet {
  id: string;
  name: string | null;
  min: number;
  max: number;
  groups: CalendarGroup[];
}
