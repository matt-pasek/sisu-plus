import type { LinkedTimetableState } from './LinkedTimetableState.type';

export interface ReminderReadiness {
  plansLoaded: boolean;
  rowsSettled: boolean;
  courseUnitsSettled: boolean;
  roomsSettled: boolean;
  candidatesSettled: boolean;
  extraCoursesSettled: boolean;
  linksLoaded: boolean;
  linkedStates: LinkedTimetableState[];
}
