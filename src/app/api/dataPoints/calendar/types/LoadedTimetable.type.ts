import type { TimetableFailure } from '@/shared/timetables/TimetableFailure.type';

export interface LoadedTimetable {
  text: string | null;
  fetchedAt: number | null;
  stale: boolean;
  reason: TimetableFailure | null;
}
