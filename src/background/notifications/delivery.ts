import type { UniversityConfig } from '@/app/types/universityConfig';
import { getNotificationPrefs } from '@/background/notifications/prefs';
import { queueUnreadNotification } from '@/background/notifications/storage';
import type {
  NotificationDeliveryDecision,
  NotificationPayload,
  QueuedInAppNotification,
} from '@/background/notifications/types';

const getNotificationId = (payload: NotificationPayload) => `sisu-plus-notification:${payload.type}:${payload.eventId}`;

const getSisuDashboardUrl = async (): Promise<string | null> => {
  const { universityConfig } = await chrome.storage.sync.get('universityConfig');
  const config = (universityConfig as UniversityConfig | null) ?? null;
  return config ? `${config.sisuOrigin}/student/frontpage` : null;
};

const getSisuTabs = async (): Promise<chrome.tabs.Tab[]> => {
  const { universityConfig } = await chrome.storage.sync.get('universityConfig');
  const config = (universityConfig as UniversityConfig | null) ?? null;
  if (!config) return [];
  return chrome.tabs.query({ url: `${config.sisuOrigin}/*` });
};

const sendInAppNotification = async (payload: NotificationPayload): Promise<number> => {
  const tabs = await getSisuTabs();
  const settled = await Promise.allSettled(
    tabs
      .filter((tab) => typeof tab.id === 'number')
      .map((tab) =>
        chrome.tabs.sendMessage(tab.id as number, {
          type: 'SISU_PLUS_NOTIFICATION',
          notification: payload,
        }),
      ),
  );

  return settled.filter((result) => result.status === 'fulfilled').length;
};

const sendDesktopNotification = async (payload: NotificationPayload): Promise<boolean> => {
  await chrome.notifications.create(getNotificationId(payload), {
    type: 'basic',
    iconUrl: chrome.runtime.getURL('favicon.png'),
    title: payload.title,
    message: payload.body,
  });

  return true;
};

export const deliverNotification = async (payload: NotificationPayload): Promise<NotificationDeliveryDecision> => {
  const prefs = await getNotificationPrefs();
  const mode = prefs.delivery[payload.type];
  if (mode === 'off') return { desktopSent: false, mode, visibleTabCount: 0 };

  const shouldSendDesktop = mode === 'out-of-app' || mode === 'both';
  const shouldSendInApp = mode === 'in-app' || mode === 'both';
  const desktopSent = shouldSendDesktop ? await sendDesktopNotification(payload) : false;
  const visibleTabCount = shouldSendInApp ? await sendInAppNotification(payload) : 0;

  if (shouldSendInApp && visibleTabCount === 0 && !desktopSent) {
    const queued: QueuedInAppNotification = {
      ...payload,
      createdAt: Date.now(),
      id: getNotificationId(payload),
      read: false,
    };

    await queueUnreadNotification(queued);
  }

  return { desktopSent, mode, visibleTabCount };
};

export const openNotificationTarget = async () => {
  const url = await getSisuDashboardUrl();
  if (!url) return;

  const tabs = await getSisuTabs();
  const existing = tabs.find((tab) => typeof tab.id === 'number');

  if (existing?.id) {
    await chrome.tabs.update(existing.id, { active: true, url });
    if (existing.windowId) await chrome.windows.update(existing.windowId, { focused: true });
    return;
  }

  await chrome.tabs.create({ url });
};
