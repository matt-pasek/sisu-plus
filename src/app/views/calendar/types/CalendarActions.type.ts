import type { CalendarCourse, GroupFlagChange } from '@/app/api/dataPoints/calendar/types';
import type { Session, Swap } from '@/app/schedule';

export interface CalendarActions {
  swap: (courseKey: string, swaps: Swap[]) => void;
  undoSwap: (session: Session) => void;
  makeUsual: (courseKey: string, setId: string, groupId: string | null) => void;
  skip: (session: Session, keep: Session, everyTime: boolean) => void;
  undoSkip: (session: Session) => void;
  dismiss: (courseKey: string, id: string) => void;
  setGroups: (course: CalendarCourse, changes: GroupFlagChange[]) => void;
  setCourseVisible: (course: CalendarCourse, visible: boolean) => void;
}
