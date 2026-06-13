import type { TFunction } from 'i18next';
import type { NotificationPrefs } from '@/app/types/NotificationPrefs.type';
import type { NotificationDeliveryMode } from '@/app/types/NotificationDeliveryMode.type';
import type { NotificationType } from '@/app/types/NotificationType.type';
import { useNotificationCache } from '@/app/hooks/useNotificationCache';

const notificationTypes: NotificationType[] = [
  'moodle-deadline',
  'registration-close',
  'registration-open',
  'sisu-sync',
];
const deliveryModes: NotificationDeliveryMode[] = ['off', 'in-app', 'out-of-app', 'both'];

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
  const { cache, unread: unreadItems } = useNotificationCache();
  const lastMoodleFetch = cache?.moodle.lastFetch
    ? new Date(cache.moodle.lastFetch).toLocaleString()
    : t('notifications.never');
  const lastSisuSync = cache?.sisu.lastSync ? new Date(cache.sisu.lastSync).toLocaleString() : t('notifications.never');

  const setDeliveryMode = (type: NotificationType, mode: NotificationDeliveryMode) => {
    onPrefsChange({
      ...notificationPrefs,
      delivery: {
        ...notificationPrefs.delivery,
        [type]: mode,
      },
    });
  };

  const setRegistrationLead = (value: number) => {
    onPrefsChange({
      ...notificationPrefs,
      registrationOpenLeadMinutes: value,
    });
  };

  const markAllRead = () => {
    chrome.runtime.sendMessage({ type: 'MARK_ALL_NOTIFICATIONS_READ' }, () => undefined);
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 p-5 pb-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-[0.16em] text-accent uppercase">
            {t('notifications.eyebrow')}
          </span>
          <h2 className="mt-1 text-xl font-semibold text-offwhite">{t('notifications.title')}</h2>
          <p className="mt-1 max-w-xl text-sm leading-6 text-lightGrey">{t('notifications.body')}</p>
        </div>
        <button
          className="min-h-10 shrink-0 cursor-pointer rounded-xl bg-container2 px-4 text-sm font-semibold text-lightGrey transition-[background-color,color,transform] duration-200 hover:bg-offwhite/10 hover:text-offwhite active:scale-[0.96]"
          onClick={onBack}
          type="button"
        >
          {t('notifications.back')}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-container p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]">
          <p className="text-[11px] font-semibold tracking-wide text-lightGrey uppercase">
            {t('notifications.stats.unread')}
          </p>
          <p className="mt-2 text-2xl font-semibold text-offwhite">{unreadItems.length}</p>
        </div>
        <div className="rounded-2xl bg-container p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]">
          <p className="text-[11px] font-semibold tracking-wide text-lightGrey uppercase">
            {t('notifications.stats.moodle')}
          </p>
          <p className="mt-2 truncate text-sm font-semibold text-offwhite">{lastMoodleFetch}</p>
        </div>
        <div className="rounded-2xl bg-container p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]">
          <p className="text-[11px] font-semibold tracking-wide text-lightGrey uppercase">
            {t('notifications.stats.sisu')}
          </p>
          <p className="mt-2 truncate text-sm font-semibold text-offwhite">{lastSisuSync}</p>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        <div className="flex flex-col gap-3">
          {notificationTypes.map((type) => (
            <section
              key={type}
              className="rounded-2xl bg-container p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-offwhite">{t(`notifications.types.${type}.title`)}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-lightGrey">{t(`notifications.types.${type}.body`)}</p>
                </div>
                <div className="grid shrink-0 grid-cols-4 overflow-hidden rounded-xl bg-background/70 p-1 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
                  {deliveryModes.map((mode) => {
                    const selected = notificationPrefs.delivery[type] === mode;
                    return (
                      <button
                        key={mode}
                        className={`min-h-8 cursor-pointer rounded-lg px-2 text-[11px] font-semibold transition-[background-color,color,transform] duration-150 active:scale-[0.96] ${
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
              <div>
                <h3 className="text-sm font-semibold text-offwhite">{t('notifications.lead.title')}</h3>
                <p className="mt-1 text-xs leading-relaxed text-lightGrey">{t('notifications.lead.body')}</p>
              </div>
              <select
                className="h-10 cursor-pointer rounded-xl border-0 bg-background px-3 text-sm font-semibold text-offwhite shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] outline-none"
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

          <section className="rounded-2xl bg-container p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-offwhite">{t('notifications.unread.title')}</h3>
              {unreadItems.length > 0 && (
                <button
                  className="min-h-8 cursor-pointer rounded-lg px-3 text-xs font-semibold text-lightGrey transition-[background-color,color,transform] duration-150 hover:bg-offwhite/10 hover:text-offwhite active:scale-[0.96]"
                  onClick={markAllRead}
                  type="button"
                >
                  {t('notifications.unread.markAll')}
                </button>
              )}
            </div>
            {unreadItems.length === 0 ? (
              <p className="text-xs leading-relaxed text-lightGrey">{t('notifications.unread.empty')}</p>
            ) : (
              <div className="flex flex-col gap-2">
                {unreadItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="rounded-xl bg-background/70 px-3 py-2">
                    <p className="text-sm font-semibold text-offwhite">{item.title}</p>
                    <p className="mt-1 text-xs text-lightGrey">{item.body}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
