import { motion } from 'motion/react';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { useChromeStorage } from '@/app/hooks/useChromeStorage';
import { DEFAULT_NOTIFICATION_PREFS } from '@/app/types/prefs';
import { notify } from '@/app/components/ui/notify';

const ONBOARDING_STEP_COUNT = 6;

interface OnboardingPanelProps {
  active: boolean;
  moodleToken: string;
  moodleCalendarPlaceholder: string;
  step: number;
  validMoodleUrl: boolean;
  onActivate: () => void;
  onComplete: () => void;
  onMoodleTokenChange: (value: string) => void;
  onSkip: () => void;
  onStepChange: (step: number) => void;
}

interface OnboardingIconProps {
  path: string;
  className?: string;
}

function OnboardingIcon({ path, className = 'size-5' }: OnboardingIconProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d={path} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

const ICONS = {
  spark:
    'M12 3.75 13.75 9 19 10.75 13.75 12.5 12 17.75 10.25 12.5 5 10.75 10.25 9 12 3.75ZM18 15.75l.75 2.25L21 18.75l-2.25.75L18 21.75l-.75-2.25L15 18.75l2.25-.75.75-2.25Z',
  control: 'M4.5 7.5h9M16.5 7.5h3M4.5 16.5h3M10.5 16.5h9M13.5 5.25v4.5M7.5 14.25v4.5',
  power: 'M12 3.75v7.5M7.25 6.75a7 7 0 1 0 9.5 0',
  bell: 'M15.5 18.25a3.5 3.5 0 0 1-7 0M18.5 16.75h-13c1.15-1.25 1.8-2.75 1.8-4.5V10a4.7 4.7 0 0 1 9.4 0v2.25c0 1.75.65 3.25 1.8 4.5Z',
  dashboard: 'M4.5 5.25h6v5.5h-6v-5.5ZM13.5 5.25h6v3.5h-6v-3.5ZM13.5 11.75h6v7h-6v-7ZM4.5 13.75h6v5h-6v-5Z',
  timeline: 'M5 6.5h14M5 12h14M5 17.5h14M8 4.5v4M15.5 10v4M11 15.5v4',
  link: 'M9.75 14.25 14.25 9.75M10.5 7.5l1.1-1.1a4 4 0 0 1 5.66 5.66l-1.1 1.1M13.5 16.5l-1.1 1.1a4 4 0 1 1-5.66-5.66l1.1-1.1',
  check: 'M5 12l5 5L19 7',
  structure: 'M6 5.25h12M6 9h8.25M6 12.75h6M6 16.5h3.75',
  registration:
    'M9 5.25H6a1.5 1.5 0 0 0-1.5 1.5v12A1.5 1.5 0 0 0 6 20.25h12a1.5 1.5 0 0 0 1.5-1.5v-12a1.5 1.5 0 0 0-1.5-1.5h-3m-4.5 4.5h6m-6 3h6m-6 3h3',
} as const;

function clampStep(step: number) {
  return Math.min(Math.max(step, 0), ONBOARDING_STEP_COUNT - 1);
}

export function OnboardingPanel({
  active,
  moodleToken,
  moodleCalendarPlaceholder,
  step,
  validMoodleUrl,
  onActivate,
  onComplete,
  onMoodleTokenChange,
  onSkip,
  onStepChange,
}: OnboardingPanelProps) {
  const { t } = useTranslationWithPrefix('controlCenter.onboarding');
  const [prefs, setPrefs] = useChromeStorage();
  const moodleCalendarExportUrl = prefs.universityConfig
    ? `${prefs.universityConfig.moodleOrigin}/calendar/export.php?`
    : '';
  const notificationsEnabled = prefs.notificationPrefs?.delivery?.['moodle-deadline'] === 'out-of-app';
  const safeStep = clampStep(step);
  const isLastStep = safeStep === ONBOARDING_STEP_COUNT - 1;
  const onboardingSteps = t('steps', { returnObjects: true }) as string[];

  function goNext() {
    if (safeStep === 2 && !active) {
      onActivate();
      return;
    }

    if (isLastStep) {
      onComplete();
      return;
    }

    onStepChange(safeStep + 1);
  }

  function enableBrowserNotifications() {
    setPrefs({
      notificationPrefs: {
        ...DEFAULT_NOTIFICATION_PREFS,
        ...(prefs.notificationPrefs ?? {}),
        delivery: {
          ...DEFAULT_NOTIFICATION_PREFS.delivery,
          ...(prefs.notificationPrefs?.delivery ?? {}),
          'moodle-deadline': 'out-of-app',
          'registration-close': 'out-of-app',
          'registration-open': 'out-of-app',
          'sisu-sync': 'off',
        },
      },
    });
    notify.notification(t('notifications.enabledTitle'), t('notifications.enabledBody'));
    chrome.runtime.sendMessage({ type: 'RESCHEDULE_NOTIFICATIONS' }, () => undefined);
  }

  const primaryLabel =
    safeStep === 2 && !active
      ? t('turnOn')
      : safeStep === 3
        ? t('notifications.looksGood')
        : isLastStep
          ? t('finishSetup')
          : t('continue');

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 p-5 pb-20">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-accent/15 text-accent shadow-[inset_0_0_0_1px_rgba(65,150,72,0.18)]">
              <OnboardingIcon path={ICONS.spark} />
            </span>
            <div>
              <span className="text-xs font-semibold tracking-wide text-offwhite/70 uppercase">
                {t('firstRunSetup')}
              </span>
              <h2 className="text-xl leading-tight font-semibold text-balance text-offwhite">SISU+</h2>
            </div>
          </div>
        </div>
        <button
          className="min-h-10 shrink-0 cursor-pointer rounded-xl px-3 text-xs font-semibold text-lightGrey transition-[background-color,color,transform] duration-200 hover:bg-offwhite/10 hover:text-offwhite active:scale-[0.96]"
          onClick={onSkip}
          type="button"
        >
          {t('skip')}
        </button>
      </div>

      <div className="grid grid-cols-6 gap-1.5" aria-label={t('progressLabel')}>
        {onboardingSteps.map((label, index) => (
          <button
            key={label}
            aria-current={safeStep === index ? 'step' : undefined}
            className={`h-10 cursor-pointer truncate rounded-xl px-1 text-[10px] font-semibold transition-[background-color,color,transform,box-shadow] duration-200 active:scale-[0.96] ${
              safeStep === index
                ? 'bg-accent text-background shadow-[0_10px_24px_rgba(65,150,72,0.22)]'
                : index < safeStep
                  ? 'bg-accent/15 text-accent'
                  : 'bg-container2 text-lightGrey hover:bg-offwhite/10 hover:text-offwhite'
            }`}
            onClick={() => onStepChange(index)}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>

      <motion.div
        key={safeStep}
        initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: 6, filter: 'blur(4px)' }}
        transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
        className="min-h-0 flex-1 overflow-y-auto rounded-[26px] bg-container p-4 shadow-[0_18px_42px_rgba(0,0,0,0.24),inset_0_0_0_1px_rgba(255,255,255,0.05)]"
      >
        {safeStep === 0 && (
          <div className="flex h-full flex-col justify-between gap-5">
            <div>
              <p className="text-2xl leading-tight font-semibold text-balance text-offwhite">{t('welcome.title')}</p>
              <p className="mt-3 text-sm leading-6 text-pretty text-lightGrey">{t('welcome.body')}</p>
            </div>
            <div className="grid gap-2">
              <div className="rounded-2xl bg-container2 p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
                <p className="text-sm font-semibold text-offwhite">{t('welcome.cardTitle')}</p>
                <p className="mt-1 text-xs leading-relaxed text-lightGrey">{t('welcome.cardBody')}</p>
              </div>
            </div>
          </div>
        )}

        {safeStep === 1 && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-blue-400/15 text-blue-300 shadow-[inset_0_0_0_1px_rgba(102,142,255,0.18)]">
                <OnboardingIcon path={ICONS.control} />
              </span>
              <div>
                <p className="text-lg font-semibold text-offwhite">{t('control.title')}</p>
                <p className="mt-1 text-sm leading-6 text-lightGrey">{t('control.body')}</p>
              </div>
            </div>
            <div className="rounded-2xl bg-container2 p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold tracking-wide text-lightGrey uppercase">
                  {t('control.currentMode')}
                </p>
                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    active ? 'bg-accent/15 text-accent' : 'bg-warn/15 text-warn'
                  }`}
                >
                  {active ? t('control.activeMode') : t('control.nativeMode')}
                </span>
              </div>
            </div>
          </div>
        )}

        {safeStep === 2 && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent/15 text-accent shadow-[inset_0_0_0_1px_rgba(65,150,72,0.18)]">
                <OnboardingIcon path={ICONS.power} />
              </span>
              <div>
                <p className="text-lg font-semibold text-offwhite">{t('switchOn.title')}</p>
                <p className="mt-1 text-sm leading-6 text-lightGrey">{t('switchOn.body')}</p>
              </div>
            </div>
            <div className="rounded-2xl bg-container2 p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold tracking-wide text-lightGrey uppercase">{t('switchOn.status')}</p>
                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${active ? 'bg-accent/15 text-accent' : 'bg-warn/15 text-warn'}`}
                >
                  {active ? t('switchOn.active') : t('switchOn.paused')}
                </span>
              </div>
            </div>
          </div>
        )}

        {safeStep === 3 && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent/15 text-accent shadow-[inset_0_0_0_1px_rgba(65,150,72,0.18)]">
                <OnboardingIcon path={ICONS.bell} />
              </span>
              <div>
                <p className="text-lg font-semibold text-offwhite">{t('notifications.title')}</p>
                <p className="mt-1 text-sm leading-6 text-lightGrey">{t('notifications.body')}</p>
              </div>
            </div>

            {notificationsEnabled ? (
              <div className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-accent/10 px-3 text-sm font-semibold text-accent shadow-[inset_0_0_0_1px_rgba(65,150,72,0.22)]">
                <OnboardingIcon className="size-4" path={ICONS.check} />
                {t('notifications.enabledButton')}
              </div>
            ) : (
              <button
                className="flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent/15 px-3 text-sm font-semibold text-accent shadow-[inset_0_0_0_1px_rgba(65,150,72,0.34)] transition-[background-color,color,transform] duration-200 hover:bg-accent hover:text-background active:scale-[0.98]"
                onClick={enableBrowserNotifications}
                type="button"
              >
                <OnboardingIcon className="size-4" path={ICONS.bell} />
                {t('notifications.enable')}
              </button>
            )}

            <div className="grid gap-2">
              {(['moodle-deadline', 'registration-close', 'registration-open'] as const).map((type) => (
                <div
                  key={type}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-background/70 px-3 py-2.5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span
                      className={`size-2.5 shrink-0 rounded-full ${
                        type === 'moodle-deadline'
                          ? 'bg-blue-400'
                          : type === 'registration-close'
                            ? 'bg-danger'
                            : 'bg-lighterGreen'
                      }`}
                    />
                    <p className="truncate text-sm font-semibold text-offwhite">
                      {t(`notifications.types.${type}.title`)}
                    </p>
                  </div>
                  <span className="rounded-full bg-accent/15 px-2.5 py-1 text-xs font-semibold text-accent">
                    {t('notifications.delivery.desktop')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {safeStep === 4 && (
          <div className="space-y-3">
            <p className="text-xl font-semibold text-balance text-offwhite">{t('views.title')}</p>
            <div className="grid gap-2">
              {(
                [
                  { key: 'dashboard', icon: ICONS.dashboard, color: 'bg-accent/15 text-accent' },
                  { key: 'timeline', icon: ICONS.timeline, color: 'bg-blue-400/15 text-blue-300' },
                  { key: 'structure', icon: ICONS.structure, color: 'bg-purple-400/15 text-purple-300' },
                  { key: 'registration', icon: ICONS.registration, color: 'bg-warn/15 text-warn' },
                ] as const
              ).map(({ key, icon, color }) => (
                <article
                  key={key}
                  className="rounded-2xl bg-container2 p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]"
                >
                  <div className="flex gap-3">
                    <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${color}`}>
                      <OnboardingIcon className="size-4" path={icon} />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-offwhite">{t(`views.${key}Title`)}</h3>
                      <p className="mt-0.5 text-xs leading-relaxed text-lightGrey">{t(`views.${key}Body`)}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {safeStep === 5 && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-warn/15 text-warn shadow-[inset_0_0_0_1px_rgba(240,168,77,0.18)]">
                <OnboardingIcon path={ICONS.link} />
              </span>
              <div>
                <p className="text-lg font-semibold text-offwhite">{t('moodle.title')}</p>
                <p className="mt-1 text-sm leading-6 text-lightGrey">{t('moodle.body')}</p>
              </div>
            </div>

            <a
              className="flex min-h-10 cursor-pointer items-center justify-center rounded-xl bg-container2 px-3 text-sm font-semibold text-offwhite transition-[background-color,color,transform] duration-200 hover:bg-offwhite/10 active:scale-[0.96]"
              href={moodleCalendarExportUrl}
              rel="noreferrer"
              target="_blank"
            >
              {t('moodle.openExport')}
            </a>

            <div>
              <label
                className="text-xs font-semibold tracking-wide text-lightGrey uppercase"
                htmlFor="sisu-plus-onboarding-moodle-url"
              >
                {t('moodle.urlLabel')}
              </label>
              <div
                className={`mt-2 rounded-2xl bg-background/80 px-3 py-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] transition-[box-shadow] duration-200 ${
                  validMoodleUrl
                    ? 'focus-within:shadow-[inset_0_0_0_1px_rgba(65,150,72,0.65)]'
                    : 'shadow-[inset_0_0_0_1px_rgba(240,107,107,0.45)]'
                }`}
              >
                <input
                  id="sisu-plus-onboarding-moodle-url"
                  value={moodleToken}
                  onChange={(event) => onMoodleTokenChange(event.target.value)}
                  placeholder={moodleCalendarPlaceholder}
                  spellCheck={false}
                  className="block h-11 w-full border-0 bg-transparent p-0 font-mono text-sm text-offwhite outline-none placeholder:text-lightGrey/55"
                />
              </div>
              <p className={`mt-2 text-xs leading-relaxed ${validMoodleUrl ? 'text-lightGrey' : 'text-danger'}`}>
                {validMoodleUrl ? t('moodle.validHint') : t('moodle.invalidHint')}
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {safeStep === 3 && <p className="px-1 text-xs leading-relaxed text-lightGrey">{t('notifications.manageHint')}</p>}

      <div className="flex items-center justify-between gap-3">
        <button
          className="min-h-11 cursor-pointer rounded-xl px-4 text-sm font-semibold text-lightGrey transition-[background-color,color,transform] duration-200 hover:bg-offwhite/10 hover:text-offwhite active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-40"
          disabled={safeStep === 0}
          onClick={() => onStepChange(safeStep - 1)}
          type="button"
        >
          {t('back')}
        </button>
        <button
          className="min-h-11 cursor-pointer rounded-xl bg-accent px-5 text-sm font-semibold text-background shadow-[0_12px_26px_rgba(65,150,72,0.24)] transition-[background-color,transform,box-shadow,opacity] duration-200 hover:bg-lighterGreen active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-50"
          onClick={goNext}
          type="button"
        >
          {primaryLabel}
        </button>
      </div>
    </div>
  );
}
