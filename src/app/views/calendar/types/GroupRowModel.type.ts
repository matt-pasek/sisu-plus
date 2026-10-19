import type { CalendarGroup } from '@/app/api/dataPoints/calendar/types';
import type { GroupStats } from '@/app/schedule';

export interface GroupRowModel {
  group: CalendarGroup;
  name: string;
  details: string;
  stats: GroupStats;
  shownThrough: string[];
}
