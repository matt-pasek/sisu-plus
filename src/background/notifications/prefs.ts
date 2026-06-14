import { DEFAULT_NOTIFICATION_PREFS, type SisuPrefs } from '@/app/types/prefs';
import type { NotificationPrefs } from '@/app/types/NotificationPrefs.type';

export const getNotificationPrefs = async (): Promise<NotificationPrefs> => {
  const stored = (await chrome.storage.sync.get('notificationPrefs')) as Partial<SisuPrefs>;
  const prefs = stored.notificationPrefs;

  return {
    delivery: {
      ...DEFAULT_NOTIFICATION_PREFS.delivery,
      ...(prefs?.delivery ?? {}),
    },
    registrationOpenLeadMinutes:
      typeof prefs?.registrationOpenLeadMinutes === 'number'
        ? prefs.registrationOpenLeadMinutes
        : DEFAULT_NOTIFICATION_PREFS.registrationOpenLeadMinutes,
  };
};
