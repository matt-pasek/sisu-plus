import type { RoomInfo } from '@/app/api/dataPoints/calendar/types';
import { addDaysToDateKey, helsinkiDateKey, type DateRange, type Session } from '@/app/schedule';
import type { CachedClassSession, ClassReminderSnapshot } from '@/background/notifications/types';
import type { ReminderLabels } from '../types';
import { sessionRoom } from './rooms';

const WINDOW_DAYS = 7;

const toCached = (session: Session, rooms: Record<string, RoomInfo>, labels: ReminderLabels): CachedClassSession => ({
  id: session.id,
  startsAt: session.start.toISOString(),
  endsAt: session.end.toISOString(),
  courseName: session.courseName,
  kindLabel: labels.kind(session.kind),
  room: sessionRoom(session, rooms, labels.room),
  isExam: session.kind === 'exam',
});

export const toReminderSnapshot = (
  attended: Session[],
  rooms: Record<string, RoomInfo>,
  range: DateRange,
  now: Date,
  labels: ReminderLabels,
): ClassReminderSnapshot | null => {
  const today = helsinkiDateKey(now);
  if (today < range.startKey || today >= range.endKey) return null;
  const weekEnd = addDaysToDateKey(today, WINDOW_DAYS - 1);
  const lastInRange = addDaysToDateKey(range.endKey, -1);
  const horizonKey = weekEnd < lastInRange ? weekEnd : lastInRange;
  const live = attended.filter((session) => !session.cancelled);
  return {
    sessions: live
      .filter((session) => session.dateKey <= horizonKey && session.start > now)
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .map((session) => toCached(session, rooms, labels)),
    horizonKey,
    horizonLabel: labels.date(horizonKey),
    hasMoreAfter: live.some((session) => session.dateKey > horizonKey),
    hasExamsAfter: live.some((session) => session.dateKey > horizonKey && session.kind === 'exam'),
    syncedAt: now.getTime(),
  };
};

export const reminderSyncKey = (snapshot: ClassReminderSnapshot): string =>
  JSON.stringify({ ...snapshot, syncedAt: 0 });
