import type { LinkedTimetableState } from './LinkedTimetableState.type';

export interface PruneReadiness {
  plansLoaded: boolean;
  rowsSettled: boolean;
  candidatesSettled: boolean;
  extraCoursesSettled: boolean;
  linksLoaded: boolean;
  linkedStates: LinkedTimetableState[];
}
