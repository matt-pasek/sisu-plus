import type { NotificationPrefs } from '@/app/types/NotificationPrefs.type';
import type { StoredNotificationPrefs } from '@/app/types/StoredNotificationPrefs.type';
import { normalizeNotificationPrefs } from '@/shared/notifications/normalizeNotificationPrefs';

export const getNotificationPrefs = async (): Promise<NotificationPrefs> => {
  const stored = await chrome.storage.sync.get('notificationPrefs');
  return normalizeNotificationPrefs(stored.notificationPrefs as StoredNotificationPrefs | undefined);
};
