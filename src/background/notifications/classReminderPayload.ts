import type { NotificationStrings } from './backgroundStrings';
import type { ClassReminderAlarm } from './classReminders';
import type { ClassReminderSnapshot, NotificationPayload } from './types';

const MINUTE_MS = 60_000;

export const classReminderPayload = (
  snapshot: ClassReminderSnapshot | null,
  alarm: ClassReminderAlarm,
  now: number,
  s: NotificationStrings,
): NotificationPayload | null => {
  if (!snapshot) return null;
  if (alarm.kind === 'horizon') {
    if (!snapshot.hasMoreAfter || snapshot.horizonKey !== alarm.horizonKey) return null;
    return {
      body: s.reminderHorizonBody,
      eventId: `horizon:${alarm.horizonKey}`,
      source: 'sisu',
      title: s.reminderHorizonTitle(snapshot.horizonLabel),
      type: 'class-reminder',
    };
  }
  const session = snapshot.sessions.find((item) => item.id === alarm.sessionId);
  const startsAt = session ? Date.parse(session.startsAt) : Number.NaN;
  if (!session || !(now < startsAt)) return null;
  const minutesLeft = Math.max(1, Math.ceil((startsAt - now) / MINUTE_MS));
  return {
    body: s.classReminderBody(session.kindLabel, session.room),
    eventId: session.id,
    source: 'sisu',
    title: s.classReminderTitle(session.courseName, s.leadTime(minutesLeft)),
    type: 'class-reminder',
  };
};
