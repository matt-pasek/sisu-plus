import type { UniversityConfig } from '@/app/types/universityConfig';
import { fetchMoodleCalendar } from '@/background/moodle/moodleFetch';
import {
  markAllNotificationsRead,
  markNotificationRead,
  getNotificationCache,
  queueUnreadNotification,
} from '@/background/notifications/storage';
import { scheduleNotificationAlarms, syncSisuNotificationCache } from '@/background/notifications/scheduler';
import type { SisuNotificationSyncPayload } from '@/background/notifications/types';
import { clearSessionForOrigin, syncRuntimeForConfig } from '@/background/runtime/sisuRuntime';
import { getSisuTokenForOrigin } from '@/background/session/sessionStore';
import { getOrigin } from '@/background/util/origin';
import { DEV_TEST_NOTIFICATION_PAYLOADS, isNotificationType } from '@/shared/notifications/devTestPayloads';

export interface MessageRouterOptions {
  setCachedConfig: (config: UniversityConfig | null) => void;
}

const sendError = (sendResponse: (response?: unknown) => void, err: unknown) => {
  sendResponse({ err: err instanceof Error ? err.message : String(err) });
};

export const createMessageRouter =
  ({ setCachedConfig }: MessageRouterOptions): Parameters<typeof chrome.runtime.onMessage.addListener>[0] =>
  (message, _sender, sendResponse) => {
    if (message.type === 'GET_TOKEN') {
      const origin = getOrigin(message.origin);

      getSisuTokenForOrigin(origin).then((sisuToken) => {
        sendResponse({ sisuToken });
      });

      return true;
    }

    if (message.type === 'CLEAR_SESSION_FOR_ORIGIN') {
      const origin = getOrigin(message.origin);

      if (!origin) {
        sendResponse({ ok: false });
        return false;
      }

      clearSessionForOrigin(origin)
        .then(() => sendResponse({ ok: true }))
        .catch((err) => sendResponse({ ok: false, err }));

      return true;
    }

    if (message.type === 'SYNC_CONTENT_SCRIPT') {
      chrome.storage.sync.get('universityConfig').then(({ universityConfig }) => {
        const config = (universityConfig as UniversityConfig) ?? null;

        setCachedConfig(config);

        syncRuntimeForConfig(config)
          .then(() => sendResponse({ ok: true }))
          .catch((err) => sendResponse({ ok: false, err }));
      });

      return true;
    }

    if (message.type === 'GET_MOODLE') {
      fetchMoodleCalendar()
        .then((textData) => {
          sendResponse(textData);
        })
        .catch((err) => {
          sendError(sendResponse, err);
        });

      return true;
    }

    if (message.type === 'GET_NOTIFICATION_STATE') {
      getNotificationCache()
        .then((cache) => sendResponse({ ok: true, cache }))
        .catch((err) => sendResponse({ ok: false, err }));

      return true;
    }

    if (message.type === 'MARK_NOTIFICATION_READ') {
      markNotificationRead(String(message.id))
        .then(() => sendResponse({ ok: true }))
        .catch((err) => sendResponse({ ok: false, err }));

      return true;
    }

    if (message.type === 'MARK_ALL_NOTIFICATIONS_READ') {
      markAllNotificationsRead()
        .then(() => sendResponse({ ok: true }))
        .catch((err) => sendResponse({ ok: false, err }));

      return true;
    }

    if (message.type === 'SYNC_SISU_NOTIFICATION_CACHE') {
      syncSisuNotificationCache(message.payload as SisuNotificationSyncPayload)
        .then(() => sendResponse({ ok: true }))
        .catch((err) => sendResponse({ ok: false, err }));

      return true;
    }

    if (message.type === 'RESCHEDULE_NOTIFICATIONS') {
      scheduleNotificationAlarms()
        .then(() => sendResponse({ ok: true }))
        .catch((err) => sendResponse({ ok: false, err }));

      return true;
    }

    if (message.type === 'TRIGGER_TEST_NOTIFICATION') {
      const notificationType: unknown = message.notificationType;
      if (!isNotificationType(notificationType)) {
        sendResponse({ ok: false, err: 'Unknown notification type' });
        return false;
      }

      const payload = DEV_TEST_NOTIFICATION_PAYLOADS[notificationType];

      chrome.notifications.create(
        `sisu-plus-notification:${payload.type}:dev-test`,
        {
          iconUrl: chrome.runtime.getURL('favicon.png'),
          message: payload.body,
          title: payload.title,
          type: 'basic',
        },
        () => {
          const err = chrome.runtime.lastError;
          sendResponse(err ? { ok: false, err: err.message } : { ok: true });
        },
      );

      return true;
    }

    if (message.type === 'QUEUE_TEST_UNREAD') {
      const createdAt = Date.now();
      queueUnreadNotification({
        body: 'This is a test unread notification queued from dev tools.',
        createdAt,
        eventId: `dev-test-unread-${createdAt}`,
        id: `sisu-plus-notification:moodle-deadline:dev-test-unread-${createdAt}`,
        read: false,
        source: 'moodle',
        title: 'Dev: test unread',
        type: 'moodle-deadline',
      })
        .then(() => sendResponse({ ok: true }))
        .catch((err) => sendResponse({ ok: false, err }));

      return true;
    }

    return false;
  };
