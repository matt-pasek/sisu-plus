import React from 'react';
import type { TFunction } from 'i18next';
import type { NotificationPrefs } from '@/app/types/NotificationPrefs.type';
import type { NotificationDeliveryMode } from '@/app/types/NotificationDeliveryMode.type';
import type { NotificationType } from '@/app/types/NotificationType.type';
import { useNotificationCache } from '@/app/hooks/useNotificationCache';
import { ClassReminderOptions } from '@/app/controlCenter/ClassReminderOptions.comp';
import { NotificationDevTools } from '@/app/controlCenter/NotificationDevTools.comp';
import { NotificationTypeRow } from '@/app/controlCenter/NotificationTypeRow.comp';
import { SettingsSelect } from '@/app/controlCenter/SettingsSelect.comp';
import { todayKey } from '@/app/schedule';
import { countClassReminderAlarms } from '@/background/notifications/classReminders';

const notificationTypes: NotificationType[] = [
  'moodle-deadline',
  'registration-close',
  'registration-open',
  'class-reminder',
  'sisu-sync',
];
const REGISTRATION_LEADS = [0, 15, 30, 60, 120, 1440];

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

  const formatSyncTime = (timestamp: number | null | undefined) =>
    timestamp
      ? new Date(timestamp).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
      : t('notifications.never');
  const remindersOn = notificationPrefs.delivery['class-reminder'] !== 'off';
  const registrationOpenOn = notificationPrefs.delivery['registration-open'] !== 'off';
  const remindersStatus =
    cache?.calendar && cache.calendar.horizonKey >= todayKey()
      ? t('notifications.stats.remindersValue', {
          count: countClassReminderAlarms(cache.scheduledAlarms),
          date: cache.calendar.horizonLabel,
        })
      : t('notifications.stats.remindersNone');

  const setDeliveryMode = (type: NotificationType, mode: NotificationDeliveryMode) => {
    onPrefsChange({
      ...notificationPrefs,
      delivery: { ...notificationPrefs.delivery, [type]: mode },
    });
  };

  const renderOptions = (type: NotificationType) => {
    if (type === 'class-reminder' && remindersOn) {
      return (
        <ClassReminderOptions
          notificationPrefs={notificationPrefs}
          onChange={(patch) => onPrefsChange({ ...notificationPrefs, ...patch })}
          t={t}
        />
      );
    }
    if (type === 'registration-open' && registrationOpenOn) {
      return (
        <label className="flex items-center gap-2 text-xs text-lightGrey">
          {t('notifications.lead.title')}
          <SettingsSelect
            value={notificationPrefs.registrationOpenLeadMinutes}
            onChange={(event) =>
              onPrefsChange({ ...notificationPrefs, registrationOpenLeadMinutes: Number(event.target.value) })
            }
          >
            {REGISTRATION_LEADS.map((minutes) => (
              <option key={minutes} value={minutes}>
                {t(`notifications.lead.options.${minutes}`)}
              </option>
            ))}
          </SettingsSelect>
        </label>
      );
    }
    return null;
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-offwhite">{t('notifications.title')}</h2>
          <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-lightGrey tabular-nums">
            <li>{t('notifications.stats.unreadCount', { count: unreadCount })}</li>
            <li>{t('notifications.stats.moodleValue', { value: formatSyncTime(cache?.moodle.lastFetch) })}</li>
            <li>{t('notifications.stats.sisuValue', { value: formatSyncTime(cache?.sisu.lastSync) })}</li>
            {remindersOn && <li>{remindersStatus}</li>}
          </ul>
        </div>
        <button
          className="min-h-9 shrink-0 cursor-pointer rounded-xl bg-container2 px-3 text-sm font-medium text-lightGrey transition-[background-color,color,transform] duration-200 hover:bg-offwhite/10 hover:text-offwhite active:scale-[0.96]"
          onClick={onBack}
          type="button"
        >
          {t('notifications.back')}
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2">
          {notificationTypes.map((type) => (
            <NotificationTypeRow
              key={type}
              type={type}
              mode={notificationPrefs.delivery[type]}
              onModeChange={(mode) => setDeliveryMode(type, mode)}
              t={t}
            >
              {renderOptions(type)}
            </NotificationTypeRow>
          ))}

          {isDevMode() && (
            <NotificationDevTools
              notificationTypes={notificationTypes}
              registrationLeadMinutes={notificationPrefs.registrationOpenLeadMinutes}
              t={t}
            />
          )}
        </div>
      </div>
    </div>
  );
};
