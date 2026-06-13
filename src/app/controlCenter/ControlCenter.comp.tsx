import { useEffect, useState } from 'react';
import { useChromeStorage } from '@/app/hooks/useChromeStorage';
import CircularText from '@/app/components/CircularText.comp';
import { motion, AnimatePresence } from 'motion/react';
import { getMoodleCalendarExportUrlFromConfig } from '@/shared/domains';
import { OnboardingPanel } from '@/app/controlCenter/OnboardingPanel.comp';
import { NotificationSettingsPanel } from '@/app/controlCenter/NotificationSettingsPanel.comp';
import { OPEN_NOTIFICATION_SETTINGS_EVENT } from '@/app/controlCenter/notificationSettingsEvents';
import { useNotificationCache } from '@/app/hooks/useNotificationCache';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { getControlTip } from '@/app/controlCenter/controlTips';
import { DEFAULT_NOTIFICATION_PREFS } from '@/app/types/prefs';
import type { NotificationPayload } from '@/background/notifications/types';

function Toggle({ checked, onChange }: { checked: boolean; onChange: (val: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 cursor-pointer rounded-full border border-white/5 p-0 transition-[background-color,box-shadow,transform] duration-200 active:scale-[0.96] ${
        checked ? 'bg-accent/90 shadow-[0_0_18px_rgba(65,150,72,0.28)]' : 'bg-border2'
      }`}
      type="button"
    >
      <span
        className={`absolute top-1 block size-5 rounded-full transition-[left,background-color,box-shadow] duration-200 ${
          checked ? 'left-6 bg-background shadow-[0_2px_8px_rgba(0,0,0,0.35)]' : 'left-1 bg-lightGrey/70'
        }`}
      />
    </button>
  );
}

function SparkleIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="currentColor" viewBox="0 0 24 24">
      <path
        clipRule="evenodd"
        d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5ZM16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0 1 16.5 15Z"
        fillRule="evenodd"
      />
    </svg>
  );
}

function BellIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M15.5 18.25a3.5 3.5 0 0 1-7 0" strokeLinecap="round" />
      <path
        d="M18.5 16.75h-13c1.15-1.25 1.8-2.75 1.8-4.5V10a4.7 4.7 0 0 1 9.4 0v2.25c0 1.75.65 3.25 1.8 4.5Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function isValidMoodleUrl(value: string): boolean {
  if (!value.trim()) return true;

  try {
    const url = new URL(value);
    return url.hostname.includes('moodle') && url.pathname.includes('calendar');
  } catch {
    return false;
  }
}

export function ControlCenter() {
  const { t } = useTranslationWithPrefix('controlCenter');
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [activeView, setActiveView] = useState<'main' | 'notifications'>('main');
  const [liveNotification, setLiveNotification] = useState<NotificationPayload | null>(null);
  const [prefs, setPrefs, prefsLoaded] = useChromeStorage();
  const { unreadCount } = useNotificationCache();
  const isActive = prefs.sisuPlusActive;
  const moodleToken = prefs.moodleToken ?? '';
  const notificationPrefs = {
    delivery: {
      ...DEFAULT_NOTIFICATION_PREFS.delivery,
      ...(prefs.notificationPrefs?.delivery ?? {}),
    },
    registrationOpenLeadMinutes:
      prefs.notificationPrefs?.registrationOpenLeadMinutes ?? DEFAULT_NOTIFICATION_PREFS.registrationOpenLeadMinutes,
  };
  const validMoodleUrl = isValidMoodleUrl(moodleToken);
  const moodleCalendarPlaceholder = prefs.universityConfig
    ? `${getMoodleCalendarExportUrlFromConfig(prefs.universityConfig).replace('/export.php?', '/export_execute.php?')}...`
    : 'https://moodle.youruni.fi/calendar/export_execute.php?...';
  const onboardingActive = prefsLoaded && !prefs.sisuPlusOnboardingCompleted;
  const size = 80;
  const notificationsActive = !onboardingActive && activeView === 'notifications';
  const notificationNudgeVisible = prefsLoaded && !onboardingActive && !prefs.notificationNudgeDismissed;
  const openWidth = notificationsActive ? 720 : onboardingActive ? 520 : 360;
  const openHeight = notificationsActive ? 720 : onboardingActive ? 640 : 500;
  const hoverWidth = 382;
  const controlTip = getControlTip(isActive, window.location.pathname, t);

  useEffect(() => {
    if (onboardingActive) setIsOpen(true);
  }, [onboardingActive]);

  useEffect(() => {
    const listener = (message: { notification?: NotificationPayload; type?: string }) => {
      if (message.type !== 'SISU_PLUS_NOTIFICATION' || !message.notification) return;
      setLiveNotification(message.notification);
      window.setTimeout(() => setLiveNotification(null), 7000);
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  useEffect(() => {
    const listener = () => openNotificationSettings();

    window.addEventListener(OPEN_NOTIFICATION_SETTINGS_EVENT, listener);
    return () => window.removeEventListener(OPEN_NOTIFICATION_SETTINGS_EVENT, listener);
  });

  function setOnboardingStep(step: number) {
    setPrefs({ sisuPlusOnboardingStep: Math.min(Math.max(step, 0), 4) });
  }

  function skipOnboarding() {
    setPrefs({ sisuPlusOnboardingCompleted: true, sisuPlusOnboardingStep: 0 });
  }

  function completeOnboarding() {
    setPrefs({ sisuPlusActive: true, sisuPlusOnboardingCompleted: true, sisuPlusOnboardingStep: 0 });
  }

  function activateFromOnboarding() {
    setPrefs({ sisuPlusActive: true, sisuPlusOnboardingStep: 3 });
  }

  function openOnboarding() {
    void chrome.tabs.create({ url: chrome.runtime.getURL('onboarding.html') });
  }

  function updateNotificationPrefs(nextPrefs: typeof notificationPrefs) {
    setPrefs({ notificationPrefs: nextPrefs });
  }

  function dismissNotificationNudge() {
    setPrefs({ notificationNudgeDismissed: true });
  }

  function openNotificationSettings() {
    setIsOpen(true);
    setActiveView('notifications');
    setPrefs({ notificationNudgeDismissed: true });
  }

  if (prefsLoaded && !prefs.universityConfig) {
    return (
      <div
        style={{
          position: 'fixed',
          right: 16,
          bottom: 16,
          zIndex: 30,
          background: 'var(--color-background)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          padding: '16px 18px',
          maxWidth: 280,
          fontFamily: 'var(--font-sans)',
          color: 'var(--color-offwhite)',
          boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
        }}
      >
        <p style={{ fontSize: 13, marginBottom: 10, color: 'var(--color-lightGrey)' }}>Sisu+ isn't configured yet.</p>
        <button
          onClick={openOnboarding}
          style={{
            background: 'var(--color-accent)',
            border: 'none',
            borderRadius: 8,
            color: '#fff',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
            padding: '7px 14px',
            width: '100%',
          }}
          type="button"
        >
          Set up now
        </button>
      </div>
    );
  }

  return (
    <motion.div
      className="fixed right-4 bottom-4 z-30 overflow-hidden bg-background text-offwhite shadow-[0_24px_60px_rgba(0,0,0,0.38),0_0_0_1px_rgba(255,255,255,0.08)]"
      style={{ fontFamily: 'var(--font-sans)', colorScheme: 'dark' }}
      animate={{
        width: isOpen ? openWidth : isHovered ? hoverWidth : size,
        height: isOpen ? openHeight : size,
        borderRadius: isOpen ? 22 : isHovered ? 28 : size,
      }}
      transition={{ type: 'spring', bounce: 0, duration: 0.48 }}
    >
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 6, filter: 'blur(4px)', transition: { duration: 0.16 } }}
            transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
            className={`absolute inset-0 flex flex-col ${
              onboardingActive ? '' : isActive ? 'gap-4 p-5 pb-20' : 'gap-3 p-5 pb-18'
            }`}
          >
            {onboardingActive ? (
              <OnboardingPanel
                active={isActive}
                moodleCalendarPlaceholder={moodleCalendarPlaceholder}
                moodleToken={moodleToken}
                onActivate={activateFromOnboarding}
                onComplete={completeOnboarding}
                onMoodleTokenChange={(value) => setPrefs({ moodleToken: value })}
                onSkip={skipOnboarding}
                onStepChange={setOnboardingStep}
                step={prefs.sisuPlusOnboardingStep}
                validMoodleUrl={validMoodleUrl}
              />
            ) : notificationsActive ? (
              <NotificationSettingsPanel
                notificationPrefs={notificationPrefs}
                onBack={() => setActiveView('main')}
                onPrefsChange={updateNotificationPrefs}
                t={t}
              />
            ) : (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-sm font-semibold tracking-wide text-offwhite/80 uppercase">{t('title')}</span>
                    <p className="mt-1 text-xs leading-relaxed text-lightGrey">
                      {isActive ? t('activate.descriptionActive') : t('activate.descriptionPaused')}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      isActive ? 'bg-accent/15 text-accent' : 'bg-warn/15 text-warn'
                    }`}
                  >
                    {isActive ? t('status.active') : t('status.paused')}
                  </span>
                </div>

                <div className="rounded-2xl bg-container p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-offwhite">{t('activate.title')}</p>
                      <p className="mt-0.5 text-xs text-lightGrey">
                        {isActive ? t('activate.helperActive') : t('activate.helperPaused')}
                      </p>
                    </div>
                    <Toggle checked={prefs.sisuPlusActive} onChange={(val) => setPrefs({ sisuPlusActive: val })} />
                  </div>
                </div>

                <button
                  className="flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-2xl bg-container p-3 text-left shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)] transition-[background-color,transform] duration-200 hover:bg-container2 active:scale-[0.99]"
                  onClick={openNotificationSettings}
                  type="button"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent/14 text-accent">
                      <BellIcon />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-offwhite">{t('notifications.entry.title')}</span>
                      <span className="mt-0.5 block truncate text-xs text-lightGrey">
                        {t('notifications.entry.body')}
                      </span>
                    </span>
                  </span>
                  <span className="text-lg leading-none text-lightGrey">›</span>
                </button>

                {notificationNudgeVisible && (
                  <div className="relative overflow-hidden rounded-2xl bg-container p-3 shadow-[inset_0_0_0_1px_rgba(82,201,137,0.2),0_18px_40px_rgba(0,0,0,0.18)]">
                    <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-lighterGreen/50 to-transparent" />
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-lighterGreen text-background shadow-[0_0_20px_rgba(82,201,137,0.24)]">
                        <BellIcon />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-offwhite">{t('notifications.nudge.title')}</p>
                        <p className="mt-1 text-xs leading-relaxed text-lightGrey">{t('notifications.nudge.body')}</p>
                        <div className="mt-3 flex gap-2">
                          <button
                            className="min-h-8 cursor-pointer rounded-lg bg-accent px-3 text-xs font-semibold text-background transition-[background-color,transform] duration-150 hover:bg-lighterGreen active:scale-[0.96]"
                            onClick={openNotificationSettings}
                            type="button"
                          >
                            {t('notifications.nudge.open')}
                          </button>
                          <button
                            className="min-h-8 cursor-pointer rounded-lg px-3 text-xs font-semibold text-lightGrey transition-[background-color,color,transform] duration-150 hover:bg-offwhite/10 hover:text-offwhite active:scale-[0.96]"
                            onClick={dismissNotificationNudge}
                            type="button"
                          >
                            {t('notifications.nudge.dismiss')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {liveNotification && (
                  <div className="rounded-2xl bg-accent/10 p-3 text-xs leading-relaxed text-lighterGreen shadow-[inset_0_0_0_1px_rgba(82,201,137,0.18)]">
                    <p className="font-semibold text-offwhite">{liveNotification.title}</p>
                    <p className="mt-1 text-lightGrey">{liveNotification.body}</p>
                  </div>
                )}

                {!isActive && (
                  <div className="rounded-2xl bg-warn/10 p-3 text-xs leading-relaxed text-warn shadow-[inset_0_0_0_1px_rgba(240,168,77,0.16)]">
                    {t('pausedNotice')}
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label
                      className="text-xs font-semibold tracking-wide text-lightGrey uppercase"
                      htmlFor="sisu-plus-moodle-url"
                    >
                      {t('moodle.label')}
                    </label>
                    <span className={`text-[11px] font-medium ${validMoodleUrl ? 'text-accent' : 'text-danger'}`}>
                      {validMoodleUrl ? t('moodle.validUrl') : t('moodle.checkUrl')}
                    </span>
                  </div>
                  <div
                    className={`rounded-2xl bg-container2 px-3 py-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] transition-shadow duration-200 ${
                      validMoodleUrl
                        ? 'focus-within:shadow-[inset_0_0_0_1px_rgba(65,150,72,0.65)]'
                        : 'shadow-[inset_0_0_0_1px_rgba(240,107,107,0.45)]'
                    }`}
                  >
                    <input
                      id="sisu-plus-moodle-url"
                      value={moodleToken}
                      onChange={(event) => setPrefs({ moodleToken: event.target.value })}
                      placeholder={moodleCalendarPlaceholder}
                      spellCheck={false}
                      className="block h-10 w-full border-0 bg-transparent p-0 font-mono text-sm text-offwhite outline-none placeholder:text-lightGrey/55"
                    />
                  </div>
                  <p className="text-xs leading-relaxed text-lightGrey">
                    {isActive ? t('moodle.connectedHelper') : ''}
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="absolute right-0 bottom-0 z-10 flex items-center"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.div
              key="close-text"
              initial={{ opacity: 0, x: 20, filter: 'blur(4px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: 10, filter: 'blur(4px)', transition: { duration: 0.12 } }}
              className="flex flex-col items-end pr-3 font-mono text-xs font-medium whitespace-nowrap text-lightGrey"
            >
              <span>{t('footer.madeWithLove', { version: import.meta.env.VITE_APP_VERSION })}</span>
              <p>
                {t('footer.by')}{' '}
                <a
                  className="text-offwhite/75 transition-colors duration-200 hover:text-offwhite"
                  href="https://matt-pasek.dev"
                  target="_blank"
                >
                  matt-pasek
                </a>{' '}
                ·{' '}
                <a
                  className="text-offwhite/75 transition-colors duration-200 hover:text-offwhite"
                  href="mailto:contact@matt-pasek.dev"
                >
                  {t('footer.contact')}
                </a>
              </p>
            </motion.div>
          ) : isHovered ? (
            <motion.div
              key="tip-text"
              initial={{ opacity: 0, x: 18, scale: 0.98, filter: 'blur(4px)' }}
              animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{
                opacity: 0,
                x: 10,
                scale: 0.98,
                filter: 'blur(4px)',
                transition: { duration: 0.12 },
              }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="mr-1 w-72.5 rounded-3xl p-3 text-left shadow-[0_14px_38px_rgba(0,0,0,0.32),inset_0_0_0_1px_rgba(255,255,255,0.06)]"
            >
              <div className="flex gap-3">
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-2xl ${controlTip.accentClass}`}
                >
                  <SparkleIcon className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold tracking-wide text-offwhite/80 uppercase">
                    {controlTip.title}
                  </p>
                  <p className="text-xs leading-relaxed text-pretty text-lightGrey">{controlTip.body}</p>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <button
          aria-label={isOpen ? t('toggle.close') : t('toggle.open')}
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-full p-2 text-offwhite transition-[transform,opacity] duration-200 active:scale-[0.96]"
          type="button"
        >
          {unreadCount > 0 ? (
            <span className="absolute top-2 right-2 z-20 flex min-w-5 items-center justify-center rounded-full bg-warn px-1.5 py-0.5 text-[10px] font-bold text-background shadow-[0_0_18px_rgba(240,168,77,0.36)]">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          ) : notificationNudgeVisible ? (
            <span className="absolute top-3 right-3 z-20 flex size-3">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-lighterGreen opacity-60" />
              <span className="relative inline-flex size-3 rounded-full bg-lighterGreen shadow-[0_0_16px_rgba(82,201,137,0.5)]" />
            </span>
          ) : null}
          <CircularText text="SISU PLUS * CONTROLS * " onHover="slowDown" spinDuration={20} />
        </button>
      </div>
    </motion.div>
  );
}
