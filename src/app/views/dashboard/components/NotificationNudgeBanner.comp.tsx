import React from 'react';
import { useChromeStorage } from '@/app/hooks/useChromeStorage';
import { useNotificationCache } from '@/app/hooks/useNotificationCache';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { requestNotificationSettingsOpen } from '@/app/controlCenter/notificationSettingsEvents';

interface NotificationNudgeBannerProps {
  hasMoodleToken: boolean;
  hasRegistrationData: boolean;
}

export const NotificationNudgeBanner: React.FC<NotificationNudgeBannerProps> = ({
  hasMoodleToken,
  hasRegistrationData,
}) => {
  const { t } = useTranslationWithPrefix('views.dashboard');
  const [prefs, setPrefs, prefsLoaded] = useChromeStorage();
  const { unreadCount } = useNotificationCache();
  const showSetupNudge =
    prefsLoaded && !prefs.notificationNudgeDismissed && (hasMoodleToken || hasRegistrationData || prefs.sisuPlusActive);
  const visible = unreadCount > 0 || showSetupNudge;

  if (!visible) return null;

  const openSettings = () => {
    setPrefs({ notificationNudgeDismissed: true });
    requestNotificationSettingsOpen();
  };

  const dismiss = () => {
    setPrefs({ notificationNudgeDismissed: true });
  };

  return (
    <section className="relative overflow-hidden rounded-[16px] bg-container px-4 py-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07),0_18px_46px_rgba(0,0,0,0.22)]">
      <span className="pointer-events-none absolute inset-y-3 left-0 w-1 rounded-r-full bg-lighterGreen shadow-[0_0_22px_rgba(82,201,137,0.45)]" />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 pl-2">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-accent uppercase">
            {t('notificationNudge.eyebrow')}
          </p>
          <h2 className="mt-1 text-base font-semibold text-offwhite">
            {unreadCount > 0
              ? t('notificationNudge.unreadTitle', { count: unreadCount })
              : t('notificationNudge.setupTitle')}
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-lightGrey">
            {unreadCount > 0 ? t('notificationNudge.unreadBody') : t('notificationNudge.setupBody')}
          </p>
        </div>
        <div className="flex shrink-0 gap-2 pl-2 sm:pl-0">
          <button
            className="min-h-10 cursor-pointer rounded-xl bg-accent px-4 text-sm font-semibold text-background transition-[background-color,transform,box-shadow] duration-150 hover:bg-lighterGreen hover:shadow-[0_10px_24px_rgba(82,201,137,0.18)] active:scale-[0.96]"
            onClick={openSettings}
            type="button"
          >
            {unreadCount > 0 ? t('notificationNudge.openUnread') : t('notificationNudge.openSetup')}
          </button>
          {unreadCount === 0 && (
            <button
              className="min-h-10 cursor-pointer rounded-xl px-3 text-sm font-semibold text-lightGrey transition-[background-color,color,transform] duration-150 hover:bg-offwhite/10 hover:text-offwhite active:scale-[0.96]"
              onClick={dismiss}
              type="button"
            >
              {t('notificationNudge.dismiss')}
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
