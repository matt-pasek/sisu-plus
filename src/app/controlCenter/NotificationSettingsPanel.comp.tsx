import React, { useState } from 'react';
import type { TFunction } from 'i18next';
import type { NotificationPrefs } from '@/app/types/NotificationPrefs.type';
import type { NotificationDeliveryMode } from '@/app/types/NotificationDeliveryMode.type';
import type { NotificationType } from '@/app/types/NotificationType.type';
import { useNotificationCache } from '@/app/hooks/useNotificationCache';
import { notify } from '@/app/components/ui/notify';
import { DEV_TEST_NOTIFICATION_PAYLOADS } from '@/shared/notifications/devTestPayloads';
import { formatLeadTime } from '@/shared/notifications/formatLeadTime';

const notificationTypes: NotificationType[] = [
  'moodle-deadline',
  'registration-close',
  'registration-open',
  'sisu-sync',
];
const deliveryModes: NotificationDeliveryMode[] = ['off', 'in-app', 'out-of-app', 'both'];

const TYPE_COLORS: Record<NotificationType, string> = {
  'moodle-deadline': '#3b82f6',
  'registration-close': '#f06b6b',
  'registration-open': '#52c989',
  'sisu-sync': '#f0a84d',
};

const isDevMode = () => chrome.runtime.getManifest().update_url === undefined;

interface NotificationSettingsPanelProps {
  notificationPrefs: NotificationPrefs;
  onBack: () => void;
  onPrefsChange: (prefs: NotificationPrefs) => void;
  t: TFunction<'translation', 'controlCenter'>;
}

export const NotificationSettingsPanel: React.FC<NotificationSettingsPanelProps> = ({
  notificationPrefs,
  onBack,
  onPrefsChange,
  t,
}) => {
  const { cache, unreadCount } = useNotificationCache();
  const [devOpen, setDevOpen] = useState(false);
  const [permStatus, setPermStatus] = useState<string | null>(null);
  const [testType, setTestType] = useState<NotificationType>('moodle-deadline');

  const lastMoodleFetch = cache?.moodle.lastFetch
    ? new Date(cache.moodle.lastFetch).toLocaleString()
    : t('notifications.never');
  const lastSisuSync = cache?.sisu.lastSync ? new Date(cache.sisu.lastSync).toLocaleString() : t('notifications.never');

  const setDeliveryMode = (type: NotificationType, mode: NotificationDeliveryMode) => {
    onPrefsChange({
      ...notificationPrefs,
      delivery: { ...notificationPrefs.delivery, [type]: mode },
    });
  };

  const setRegistrationLead = (value: number) => {
    onPrefsChange({ ...notificationPrefs, registrationOpenLeadMinutes: value });
  };

  const fireInAppToast = (type: NotificationType) => {
    if (type === 'registration-open') {
      const lead = notificationPrefs.registrationOpenLeadMinutes;
      const suffix = lead > 0 ? ` ${formatLeadTime(lead)}` : '';
      notify.notification(`Registrations open${suffix}`, `3 courses open for registration${suffix}.`);
      return;
    }
    const payload = DEV_TEST_NOTIFICATION_PAYLOADS[type];
    notify.notification(payload.title, payload.body);
  };

  const fireDesktopNotification = () => {
    chrome.runtime.sendMessage({ type: 'TRIGGER_TEST_NOTIFICATION', notificationType: testType }, () => undefined);
  };

  const checkPermission = () => {
    setPermStatus(t('notifications.dev.permission.current', { status: Notification.permission }));
  };

  const requestPermission = () => {
    void Notification.requestPermission().then((result) =>
      setPermStatus(t('notifications.dev.permission.result', { status: result })),
    );
  };

  const queueTestUnread = () => {
    chrome.runtime.sendMessage({ type: 'QUEUE_TEST_UNREAD' }, () => undefined);
    setPermStatus(t('notifications.dev.permission.queued'));
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-offwhite">{t('notifications.title')}</h2>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <span className="rounded-lg bg-container px-2 py-0.5 text-[10px] font-semibold text-lightGrey shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
              {t('notifications.stats.unreadCount', { count: unreadCount })}
            </span>
            <span className="rounded-lg bg-container px-2 py-0.5 text-[10px] font-semibold text-lightGrey shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
              {t('notifications.stats.moodleValue', { value: lastMoodleFetch })}
            </span>
            <span className="rounded-lg bg-container px-2 py-0.5 text-[10px] font-semibold text-lightGrey shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
              {t('notifications.stats.sisuValue', { value: lastSisuSync })}
            </span>
          </div>
        </div>
        <button
          className="min-h-9 shrink-0 cursor-pointer rounded-xl bg-container2 px-3 text-sm font-semibold text-lightGrey transition-[background-color,color,transform] duration-200 hover:bg-offwhite/10 hover:text-offwhite active:scale-[0.96]"
          onClick={onBack}
          type="button"
        >
          {t('notifications.back')}
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2">
          {notificationTypes.map((type) => (
            <section
              key={type}
              className="rounded-2xl bg-container p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]"
            >
              <div className="flex items-center gap-3">
                <span
                  className="mt-0.5 size-2 shrink-0 self-start rounded-full"
                  style={{ background: TYPE_COLORS[type], marginTop: '6px' }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-offwhite">{t(`notifications.types.${type}.title`)}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-lightGrey">
                    {t(`notifications.types.${type}.body`)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-0.5 rounded-xl bg-background/70 p-1 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
                  {deliveryModes.map((mode) => {
                    const selected = notificationPrefs.delivery[type] === mode;
                    return (
                      <button
                        key={mode}
                        className={`min-h-7 cursor-pointer rounded-lg px-2 text-[10px] font-semibold transition-[background-color,color,transform] duration-150 active:scale-[0.96] ${
                          selected
                            ? 'bg-accent text-background'
                            : 'text-lightGrey hover:bg-offwhite/10 hover:text-offwhite'
                        }`}
                        onClick={() => setDeliveryMode(type, mode)}
                        type="button"
                      >
                        {t(`notifications.delivery.${mode}`)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>
          ))}

          <section className="rounded-2xl bg-container p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-offwhite">{t('notifications.lead.title')}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-lightGrey">{t('notifications.lead.body')}</p>
              </div>
              <select
                className="h-9 cursor-pointer appearance-none rounded-xl border-0 bg-background pr-7 pl-3 text-xs font-semibold text-offwhite shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] outline-none"
                value={notificationPrefs.registrationOpenLeadMinutes}
                onChange={(event) => setRegistrationLead(Number(event.target.value))}
              >
                {[0, 15, 30, 60, 120, 1440].map((minutes) => (
                  <option key={minutes} value={minutes}>
                    {t(`notifications.lead.options.${minutes}`)}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {isDevMode() && (
            <section className="rounded-2xl bg-container shadow-[inset_0_0_0_1px_rgba(124,58,237,0.2)]">
              <button
                className="flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2.5 text-left"
                onClick={() => setDevOpen((v) => !v)}
                type="button"
              >
                <div className="flex items-center gap-2">
                  <span className="flex size-5 items-center justify-center rounded-md bg-violet-500/15 text-[10px] font-black text-violet-400">
                    D
                  </span>
                  <span className="text-xs font-semibold text-violet-400">{t('notifications.dev.title')}</span>
                </div>
                <span className="text-xs text-lightGrey/50">{devOpen ? '^' : 'v'}</span>
              </button>

              {devOpen && (
                <div className="border-t border-violet-500/10 px-3 pt-2.5 pb-3">
                  <p className="mb-1.5 text-[9px] font-bold tracking-widest text-lightGrey/40 uppercase">
                    {t('notifications.dev.inApp')}
                  </p>
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {notificationTypes.map((type) => (
                      <button
                        key={type}
                        className="cursor-pointer rounded-lg border px-2 py-1 text-[10px] font-semibold transition-[opacity,transform] duration-150 active:scale-[0.96]"
                        style={{
                          borderColor: `${TYPE_COLORS[type]}40`,
                          background: `${TYPE_COLORS[type]}12`,
                          color: TYPE_COLORS[type],
                        }}
                        onClick={() => fireInAppToast(type)}
                        type="button"
                      >
                        {t(`notifications.types.${type}.title`)}
                      </button>
                    ))}
                  </div>

                  <p className="mb-1.5 text-[9px] font-bold tracking-widest text-lightGrey/40 uppercase">
                    {t('notifications.dev.desktop')}
                  </p>
                  <div className="mb-3 flex gap-1.5">
                    <select
                      className="flex-1 appearance-none rounded-lg border-0 bg-background/60 py-1 pr-6 pl-2 text-[10px] font-semibold text-offwhite shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)] outline-none"
                      value={testType}
                      onChange={(e) => setTestType(e.target.value as NotificationType)}
                    >
                      {notificationTypes.map((type) => (
                        <option key={type} value={type}>
                          {t(`notifications.types.${type}.title`)}
                        </option>
                      ))}
                    </select>
                    <button
                      className="cursor-pointer rounded-lg bg-violet-500/15 px-3 py-1 text-[10px] font-semibold text-violet-400 transition-[opacity,transform] duration-150 active:scale-[0.96]"
                      onClick={fireDesktopNotification}
                      type="button"
                    >
                      {t('notifications.dev.send')}
                    </button>
                  </div>

                  <p className="mb-1.5 text-[9px] font-bold tracking-widest text-lightGrey/40 uppercase">
                    {t('notifications.dev.permission.title')}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      className="cursor-pointer rounded-lg bg-background/60 px-2 py-1 text-[10px] font-semibold text-lightGrey shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)] transition-[opacity,transform] duration-150 active:scale-[0.96]"
                      onClick={checkPermission}
                      type="button"
                    >
                      {t('notifications.dev.permission.check')}
                    </button>
                    <button
                      className="cursor-pointer rounded-lg bg-background/60 px-2 py-1 text-[10px] font-semibold text-lightGrey shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)] transition-[opacity,transform] duration-150 active:scale-[0.96]"
                      onClick={requestPermission}
                      type="button"
                    >
                      {t('notifications.dev.permission.request')}
                    </button>
                    <button
                      className="cursor-pointer rounded-lg bg-background/60 px-2 py-1 text-[10px] font-semibold text-lightGrey shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)] transition-[opacity,transform] duration-150 active:scale-[0.96]"
                      onClick={queueTestUnread}
                      type="button"
                    >
                      {t('notifications.dev.permission.queueUnread')}
                    </button>
                  </div>
                  {permStatus && (
                    <p className="mt-2 rounded-lg bg-violet-500/10 px-2 py-1 text-[10px] text-violet-300">
                      {permStatus}
                    </p>
                  )}
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
