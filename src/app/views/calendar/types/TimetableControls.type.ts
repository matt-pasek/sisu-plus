import type { LinkedTimetableState } from '@/app/api/dataPoints/calendar/types';

export interface TimetableControls {
  noTimesCourseKeys: Set<string>;
  sisuCourseKeys: Set<string>;
  linked: Record<string, LinkedTimetableState>;
  onAdd: (courseKey: string) => void;
  onRefresh: (courseKey: string) => void;
  onRemove: (courseKey: string) => void;
}
