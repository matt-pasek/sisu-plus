import { isClassReminderSnapshot } from '@/background/notifications/classReminders';
import type { NotificationCache, QueuedInAppNotification } from '@/background/notifications/types';

export const NOTIFICATION_CACHE_KEY = 'sisuPlusNotifications';

export const EMPTY_NOTIFICATION_CACHE: NotificationCache = {
  moodle: {
    deadlines: [],
    lastFetch: null,
  },
  scheduledAlarms: [],
  sisu: {
    lastSync: null,
    registrations: [],
  },
  unread: [],
  calendar: null,
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const normalizeNotificationCache = (stored: unknown): NotificationCache => {
  const partial = (isRecord(stored) ? stored : {}) as Partial<NotificationCache>;
  return {
    ...EMPTY_NOTIFICATION_CACHE,
    ...partial,
    moodle: { ...EMPTY_NOTIFICATION_CACHE.moodle, ...(partial.moodle ?? {}) },
    sisu: { ...EMPTY_NOTIFICATION_CACHE.sisu, ...(partial.sisu ?? {}) },
    calendar: isClassReminderSnapshot(partial.calendar) ? partial.calendar : null,
  };
};

export const getNotificationCache = async (): Promise<NotificationCache> => {
  const stored = await chrome.storage.local.get(NOTIFICATION_CACHE_KEY);
  return normalizeNotificationCache(stored[NOTIFICATION_CACHE_KEY]);
};

export const setNotificationCache = async (cache: NotificationCache) => {
  await chrome.storage.local.set({ [NOTIFICATION_CACHE_KEY]: cache });
};

export const patchNotificationCache = async (patcher: (cache: NotificationCache) => NotificationCache) => {
  const cache = await getNotificationCache();
  await setNotificationCache(patcher(cache));
};

export const queueUnreadNotification = async (notification: QueuedInAppNotification) => {
  await patchNotificationCache((cache) => ({
    ...cache,
    unread: [notification, ...cache.unread.filter((item) => item.id !== notification.id)].slice(0, 40),
  }));
};

export const markNotificationRead = async (id: string) => {
  await patchNotificationCache((cache) => ({
    ...cache,
    unread: cache.unread.map((item) => (item.id === id ? { ...item, read: true } : item)),
  }));
};

export const markAllNotificationsRead = async () => {
  await patchNotificationCache((cache) => ({
    ...cache,
    unread: cache.unread.map((item) => ({ ...item, read: true })),
  }));
};
