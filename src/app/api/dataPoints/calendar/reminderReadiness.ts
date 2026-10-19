import type { ReminderReadiness } from './types';

// Every sync replaces all stored reminders, so a partial picture (no rows yet, unnamed courses, missing rooms,
// unresolved swaps, linked timetables in flight) would schedule wrong or missing reminders until the next visit.
export const remindersReady = (readiness: ReminderReadiness): boolean =>
  readiness.plansLoaded &&
  readiness.rowsSettled &&
  readiness.courseUnitsSettled &&
  readiness.roomsSettled &&
  readiness.candidatesSettled &&
  readiness.extraCoursesSettled &&
  readiness.linksLoaded &&
  readiness.linkedStates.every((state) => state.status !== 'loading');
