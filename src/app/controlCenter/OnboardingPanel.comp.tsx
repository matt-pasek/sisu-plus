import { motion } from 'motion/react';
import { getMoodleCalendarExportUrl } from '@/shared/domains';

const ONBOARDING_STEPS = ['Welcome', 'Control', 'Switch on', 'Views', 'Moodle'] as const;

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
  dashboard: 'M4.5 5.25h6v5.5h-6v-5.5ZM13.5 5.25h6v3.5h-6v-3.5ZM13.5 11.75h6v7h-6v-7ZM4.5 13.75h6v5h-6v-5Z',
  timeline: 'M5 6.5h14M5 12h14M5 17.5h14M8 4.5v4M15.5 10v4M11 15.5v4',
  link: 'M9.75 14.25 14.25 9.75M10.5 7.5l1.1-1.1a4 4 0 0 1 5.66 5.66l-1.1 1.1M13.5 16.5l-1.1 1.1a4 4 0 1 1-5.66-5.66l1.1-1.1',
} as const;

function clampStep(step: number) {
  return Math.min(Math.max(step, 0), ONBOARDING_STEPS.length - 1);
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
  const safeStep = clampStep(step);
  const isLastStep = safeStep === ONBOARDING_STEPS.length - 1;

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

  const primaryLabel = safeStep === 2 && !active ? 'Turn on SISU+' : isLastStep ? 'Finish setup' : 'Continue';

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 p-5 pb-20">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-accent/15 text-accent shadow-[inset_0_0_0_1px_rgba(65,150,72,0.18)]">
              <OnboardingIcon path={ICONS.spark} />
            </span>
            <div>
              <span className="text-xs font-semibold tracking-wide text-offwhite/70 uppercase">First run setup</span>
              <h2 className="text-xl leading-tight font-semibold text-balance text-offwhite">Welcome to SISU+</h2>
            </div>
          </div>
        </div>
        <button
          className="min-h-10 shrink-0 cursor-pointer rounded-xl px-3 text-xs font-semibold text-lightGrey transition-[background-color,color,transform] duration-200 hover:bg-offwhite/10 hover:text-offwhite active:scale-[0.96]"
          onClick={onSkip}
          type="button"
        >
          Skip
        </button>
      </div>

      <div className="grid grid-cols-5 gap-1.5" aria-label="Onboarding progress">
        {ONBOARDING_STEPS.map((label, index) => (
          <button
            key={label}
            aria-current={safeStep === index ? 'step' : undefined}
            className={`h-10 cursor-pointer rounded-xl text-[11px] font-semibold transition-[background-color,color,transform,box-shadow] duration-200 active:scale-[0.96] ${
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
              <p className="text-2xl leading-tight font-semibold text-balance text-offwhite">
                Sisu stays untouched until you choose to switch.
              </p>
              <p className="mt-3 text-sm leading-6 text-pretty text-lightGrey">
                After installation, SISU+ starts paused. This control center lets you turn the enhanced interface on,
                configure Moodle deadlines, and come back to native Sisu whenever you need it.
              </p>
            </div>
            <div className="grid gap-2">
              <div className="rounded-2xl bg-container2 p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
                <p className="text-sm font-semibold text-offwhite">You are in control</p>
                <p className="mt-1 text-xs leading-relaxed text-lightGrey">
                  The enhanced dashboard only replaces student pages after you activate it.
                </p>
              </div>
              <div className="rounded-2xl bg-warn/10 p-3 text-xs leading-relaxed text-warn shadow-[inset_0_0_0_1px_rgba(240,168,77,0.16)]">
                First-run state and setup progress are saved in Chrome sync.
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
                <p className="text-lg font-semibold text-offwhite">Meet the control center</p>
                <p className="mt-1 text-sm leading-6 text-lightGrey">
                  This floating button is the steady place for SISU+ state. Open it to pause the extension, resume it,
                  or update Moodle sync without hunting through browser extension menus.
                </p>
              </div>
            </div>
            <div className="rounded-3xl bg-background/70 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-offwhite">Current mode</p>
                  <p className="mt-1 text-xs text-lightGrey">{active ? 'SISU+ is active' : 'Native Sisu is active'}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    active ? 'bg-accent/15 text-accent' : 'bg-warn/15 text-warn'
                  }`}
                >
                  {active ? 'Active' : 'Paused'}
                </span>
              </div>
            </div>
          </div>
        )}

        {safeStep === 2 && (
          <div className="space-y-4">
            <span className="flex size-12 items-center justify-center rounded-3xl bg-accent/15 text-accent shadow-[inset_0_0_0_1px_rgba(65,150,72,0.18)]">
              <OnboardingIcon className="size-6" path={ICONS.power} />
            </span>
            <div>
              <p className="text-xl font-semibold text-balance text-offwhite">Switch to the enhanced interface.</p>
              <p className="mt-2 text-sm leading-6 text-lightGrey">
                SISU+ will reload the student page once, then continue the tour inside the enhanced dashboard. You can
                pause it again from this same control center.
              </p>
            </div>
            <div className="rounded-2xl bg-container2 p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]">
              <p className="text-xs font-semibold tracking-wide text-lightGrey uppercase">Status</p>
              <p className={`mt-1 text-sm font-semibold ${active ? 'text-accent' : 'text-warn'}`}>
                {active ? 'SISU+ is already active.' : 'SISU+ is currently paused.'}
              </p>
            </div>
          </div>
        )}

        {safeStep === 3 && (
          <div className="space-y-3">
            <p className="text-xl font-semibold text-balance text-offwhite">Two views, one study plan.</p>
            <div className="grid gap-3">
              <article className="rounded-2xl bg-container2 p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]">
                <div className="flex gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-accent/15 text-accent">
                    <OnboardingIcon path={ICONS.dashboard} />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-offwhite">Dashboard</h3>
                    <p className="mt-1 text-xs leading-relaxed text-lightGrey">
                      A customizable overview for active courses, credits, deadlines, grade progress, and study pace.
                    </p>
                  </div>
                </div>
              </article>
              <article className="rounded-2xl bg-container2 p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]">
                <div className="flex gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-blue-400/15 text-blue-300">
                    <OnboardingIcon path={ICONS.timeline} />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-offwhite">Timeline</h3>
                    <p className="mt-1 text-xs leading-relaxed text-lightGrey">
                      A semester-by-semester planning board where you can move courses and catch prerequisite issues.
                    </p>
                  </div>
                </div>
              </article>
            </div>
          </div>
        )}

        {safeStep === 4 && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-warn/15 text-warn shadow-[inset_0_0_0_1px_rgba(240,168,77,0.18)]">
                <OnboardingIcon path={ICONS.link} />
              </span>
              <div>
                <p className="text-lg font-semibold text-offwhite">Connect Moodle deadlines</p>
                <p className="mt-1 text-sm leading-6 text-lightGrey">
                  Open Moodle calendar export, choose all events and a custom date range, then paste the generated URL
                  here.
                </p>
              </div>
            </div>

            <a
              className="flex min-h-10 cursor-pointer items-center justify-center rounded-xl bg-container2 px-3 text-sm font-semibold text-offwhite transition-[background-color,color,transform] duration-200 hover:bg-offwhite/10 active:scale-[0.96]"
              href={getMoodleCalendarExportUrl()}
              rel="noreferrer"
              target="_blank"
            >
              Open Moodle calendar export
            </a>

            <div>
              <label
                className="text-xs font-semibold tracking-wide text-lightGrey uppercase"
                htmlFor="sisu-plus-onboarding-moodle-url"
              >
                Moodle calendar URL
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
                {validMoodleUrl
                  ? 'You can finish now, or leave this empty and add it later from the control center.'
                  : 'The URL should come from Moodle calendar export and include a calendar path.'}
              </p>
            </div>
          </div>
        )}
      </motion.div>

      <div className="flex items-center justify-between gap-3">
        <button
          className="min-h-11 cursor-pointer rounded-xl px-4 text-sm font-semibold text-lightGrey transition-[background-color,color,transform] duration-200 hover:bg-offwhite/10 hover:text-offwhite active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-40"
          disabled={safeStep === 0}
          onClick={() => onStepChange(safeStep - 1)}
          type="button"
        >
          Back
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
