import type { UniversityConfig } from '@/app/types/universityConfig';
import { createMessageRouter } from '@/background/messages/messageRouter';
import { handleNotificationAlarm, scheduleNotificationAlarms } from '@/background/notifications/scheduler';
import { openNotificationTarget } from '@/background/notifications/delivery';
import { syncRuntimeForConfig } from '@/background/runtime/sisuRuntime';

let cachedConfig: UniversityConfig | null = null;

const configReady = chrome.storage.sync.get('universityConfig').then(async (result) => {
  cachedConfig = (result.universityConfig as UniversityConfig) ?? null;
  await syncRuntimeForConfig(cachedConfig);
  await scheduleNotificationAlarms();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.universityConfig) {
    cachedConfig = (changes.universityConfig.newValue as UniversityConfig) ?? null;
    void syncRuntimeForConfig(cachedConfig);
  }

  if (area === 'sync' && changes.notificationPrefs) {
    void scheduleNotificationAlarms();
  }
});

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    void chrome.tabs.create({ url: chrome.runtime.getURL('onboarding.html') });
  } else if (details.reason === 'update' && details.previousVersion && details.previousVersion <= '2.0.0') {
    void chrome.storage.sync.remove('universityConfig').then(() => {
      void chrome.tabs.create({ url: chrome.runtime.getURL('onboarding.html') });
    });
  }

  void configReady.then(() => syncRuntimeForConfig(cachedConfig));
  void scheduleNotificationAlarms();
});

chrome.runtime.onStartup.addListener(() => {
  void configReady.then(() => syncRuntimeForConfig(cachedConfig));
  void scheduleNotificationAlarms();
});

chrome.runtime.onMessage.addListener(
  createMessageRouter({
    setCachedConfig: (config) => {
      cachedConfig = config;
    },
  }),
);

chrome.alarms.onAlarm.addListener((alarm) => {
  void handleNotificationAlarm(alarm.name);
});

chrome.notifications.onClicked.addListener((notificationId) => {
  if (!notificationId.startsWith('sisu-plus-notification')) return;
  void openNotificationTarget();
});
