import type { NotificationPrefs } from '@/app/types/NotificationPrefs.type';
import type { ClassReminderSnapshot } from '@/background/notifications/types';
import type { ReminderStatus } from '../types';

export const reminderStatus = (
  prefs: NotificationPrefs,
  snapshot: ClassReminderSnapshot | null,
  today: string,
): ReminderStatus =>
  prefs.delivery['class-reminder'] === 'off'
    ? { kind: 'off' }
    : {
        kind: 'on',
        leadMinutes: prefs.classReminderLeadMinutes,
        untilLabel: snapshot && snapshot.horizonKey >= today ? snapshot.horizonLabel : null,
      };
