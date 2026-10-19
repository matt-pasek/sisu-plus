import { helsinkiWallTimeToInstant } from '@/app/schedule/time';
import type { CachedClassSession, ClassReminderSnapshot } from '../types';

export const reminderAt = (dateKey: string, hour: number): Date =>
  helsinkiWallTimeToInstant(dateKey, Math.round(hour * 60));

export const buildCachedSession = (
  id: string,
  dateKey: string,
  startHour: number,
  overrides: Partial<CachedClassSession> = {},
): CachedClassSession => ({
  id,
  startsAt: reminderAt(dateKey, startHour).toISOString(),
  endsAt: reminderAt(dateKey, startHour + 2).toISOString(),
  courseName: `Course ${id}`,
  kindLabel: 'Lecture',
  room: 'AUD1B',
  isExam: false,
  ...overrides,
});

export const buildReminderSnapshot = (overrides: Partial<ClassReminderSnapshot> = {}): ClassReminderSnapshot => ({
  sessions: [
    buildCachedSession('a', '2026-10-13', 10),
    buildCachedSession('exam', '2026-10-14', 9, { isExam: true, kindLabel: 'Exam' }),
  ],
  horizonKey: '2026-10-19',
  horizonLabel: 'Mon 19.10',
  hasMoreAfter: true,
  hasExamsAfter: true,
  syncedAt: 0,
  ...overrides,
});
