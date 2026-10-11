import type { TimetableFailure } from '@/shared/timetables/TimetableFailure.type';

export interface LinkedTimetableState {
  url: string;
  label: string;
  status: 'loading' | 'ok' | 'stale' | 'error';
  reason: TimetableFailure | null;
  fetchedAt: number | null;
  count: number;
}
