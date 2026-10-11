import type { Session } from '@/app/schedule';
import type { LinkedTimetableState } from './LinkedTimetableState.type';
import type { TimetableLink } from './TimetableLink.type';

export interface LinkedTimetables {
  sessions: Session[];
  states: Record<string, LinkedTimetableState>;
  saveLink: (courseKey: string, link: TimetableLink) => void;
  removeLink: (courseKey: string) => void;
  refresh: (courseKey: string) => void;
}
