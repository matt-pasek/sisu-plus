import React, { useState } from 'react';
import type { TFunction } from 'i18next';
import { notify } from '@/app/components/ui/notify';
import { NotificationTypeIcon } from '@/app/components/ui/notifications/NotificationTypeIcon.comp';
import { NOTIFICATION_TONE } from '@/app/components/ui/notifications/notificationTone.const';
import { SettingsSelect } from '@/app/controlCenter/SettingsSelect.comp';
import type { NotificationType } from '@/app/types/NotificationType.type';
import { DEV_TEST_NOTIFICATION_PAYLOADS } from '@/shared/notifications/devTestPayloads';
import { formatLeadTime } from '@/shared/notifications/formatLeadTime';

interface Props {
  notificationTypes: NotificationType[];
  registrationLeadMinutes: number;
  t: TFunction<'translation', 'controlCenter'>;
}

const DEV_BUTTON =
  'cursor-pointer rounded-md bg-container2 px-2 py-1 text-[11px] font-medium text-lightGrey transition-[color,transform] duration-150 hover:text-offwhite active:scale-[0.96]';

export const NotificationDevTools: React.FC<Props> = ({ notificationTypes, registrationLeadMinutes, t }) => {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [testType, setTestType] = useState<NotificationType>('moodle-deadline');

  const fireInAppToast = (type: NotificationType) => {
    if (type === 'registration-open') {
      const suffix = registrationLeadMinutes > 0 ? ` ${formatLeadTime(registrationLeadMinutes)}` : '';
      notify.notification(`Registrations open${suffix}`, `3 courses open for registration${suffix}.`);
      return;
    }
    const payload = DEV_TEST_NOTIFICATION_PAYLOADS[type];
    notify.notification(payload.title, payload.body);
  };

  const fireDesktopNotification = () => {
    chrome.runtime.sendMessage({ type: 'TRIGGER_TEST_NOTIFICATION', notificationType: testType }, () => undefined);
  };

  const queueTestUnread = () => {
    chrome.runtime.sendMessage({ type: 'QUEUE_TEST_UNREAD' }, () => undefined);
    setStatus(t('notifications.dev.permission.queued'));
  };

  return (
    <section className="rounded-2xl border border-dashed border-border2">
      <button
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2.5 text-left text-lightGrey transition-colors duration-150 hover:text-offwhite"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span className="font-mono text-[11px] font-medium">{t('notifications.dev.title')}</span>
        <svg
          aria-hidden="true"
          className={`size-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="flex flex-col gap-3 border-t border-dashed border-border2 px-3 pt-2.5 pb-3">
          <div>
            <p className="mb-1.5 text-[11px] font-medium text-lightGrey">{t('notifications.dev.inApp')}</p>
            <div className="flex flex-wrap gap-1.5">
              {notificationTypes.map((type) => (
                <button
                  key={type}
                  className={`${DEV_BUTTON} inline-flex items-center gap-1.5`}
                  onClick={() => fireInAppToast(type)}
                  type="button"
                >
                  <span className={NOTIFICATION_TONE[type]}>
                    <NotificationTypeIcon type={type} className="size-3" />
                  </span>
                  {t(`notifications.types.${type}.title`)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-[11px] font-medium text-lightGrey">{t('notifications.dev.desktop')}</p>
            <div className="flex gap-1.5">
              <SettingsSelect
                compact
                className="w-full"
                value={testType}
                onChange={(event) => {
                  const type = notificationTypes.find((item) => item === event.target.value);
                  if (type) setTestType(type);
                }}
              >
                {notificationTypes.map((type) => (
                  <option key={type} value={type}>
                    {t(`notifications.types.${type}.title`)}
                  </option>
                ))}
              </SettingsSelect>
              <button className={DEV_BUTTON} onClick={fireDesktopNotification} type="button">
                {t('notifications.dev.send')}
              </button>
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-[11px] font-medium text-lightGrey">{t('notifications.dev.permission.title')}</p>
            <div className="flex flex-wrap gap-1.5">
              <button
                className={DEV_BUTTON}
                onClick={() =>
                  setStatus(t('notifications.dev.permission.current', { status: Notification.permission }))
                }
                type="button"
              >
                {t('notifications.dev.permission.check')}
              </button>
              <button
                className={DEV_BUTTON}
                onClick={() =>
                  void Notification.requestPermission().then((result) =>
                    setStatus(t('notifications.dev.permission.result', { status: result })),
                  )
                }
                type="button"
              >
                {t('notifications.dev.permission.request')}
              </button>
              <button className={DEV_BUTTON} onClick={queueTestUnread} type="button">
                {t('notifications.dev.permission.queueUnread')}
              </button>
            </div>
            {status && <p className="mt-2 font-mono text-[11px] text-lightGrey">{status}</p>}
          </div>
        </div>
      )}
    </section>
  );
};
