import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { TitleStep } from './steps/TitleStep';
import { WelcomeStep } from './steps/WelcomeStep';
import { UniversityStep } from './steps/UniversityStep';
import { PermissionStep } from './steps/PermissionStep';
import { SuccessStep } from './steps/SuccessStep';
import Aurora from './components/Aurora';
import type { UniversityConfig } from '@/app/types/universityConfig';

type OnboardingStep = 'title' | 'welcome' | 'university' | 'permission' | 'success';

const SETUP_STEPS: OnboardingStep[] = ['welcome', 'university', 'permission', 'success'];

const AURORA_STOPS: string[] = ['#4cd696', '#2ea36b', '#34d3c3'];

const stepVariants = {
  enter: { opacity: 0, y: 22, scale: 0.992, filter: 'blur(6px)' },
  center: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -16, scale: 0.99, filter: 'blur(8px)' },
};

const stepTransition = {
  duration: 0.58,
  ease: [0.2, 0.72, 0.2, 1] as const,
};

export function App() {
  const [step, setStep] = useState<OnboardingStep | null>(null);
  const [pendingConfig, setPendingConfig] = useState<UniversityConfig | null>(null);
  const [resumedAtPermission, setResumedAtPermission] = useState(false);

  useEffect(() => {
    void (async () => {
      const stored = await chrome.storage.sync.get('universityConfig');
      const existing = stored.universityConfig as UniversityConfig | undefined;

      if (existing) {
        const hasPermission = await chrome.permissions.contains({
          origins: [`${existing.sisuOrigin}/*`, `${existing.moodleOrigin}/*`],
        });
        setPendingConfig(existing);
        if (!hasPermission) setResumedAtPermission(true);
        setStep(hasPermission ? 'success' : 'permission');
      } else {
        setStep('title');
      }
    })();
  }, []);

  function goTo(next: OnboardingStep) {
    setStep(next);
  }

  if (step === null) {
    return (
      <div className="ob-page">
        <div className="ob-aurora-bg" aria-hidden>
          <Aurora colorStops={AURORA_STOPS} amplitude={1.0} speed={0.8} blend={0.6} />
        </div>
        <div className="ob-logo">
          <div className="ob-logo-mark">S+</div>
          <span className="ob-logo-name">
            Sisu<span className="ob-logo-name-plus">+</span>
          </span>
        </div>
      </div>
    );
  }

  const setupStepIndex = SETUP_STEPS.indexOf(step);
  const hasSetupChrome = setupStepIndex >= 0;
  const progressPct = hasSetupChrome ? ((setupStepIndex + 1) / SETUP_STEPS.length) * 100 : 0;
  const pageClass = ['ob-page', step === 'title' ? 'is-title' : ''].filter(Boolean).join(' ');

  return (
    <div className={pageClass}>
      <div className="ob-aurora-bg" aria-hidden>
        <Aurora colorStops={AURORA_STOPS} amplitude={1.0} speed={0.5} blend={0.6} />
      </div>

      {hasSetupChrome && (
        <div
          className="ob-progress-track"
          role="progressbar"
          aria-valuenow={setupStepIndex + 1}
          aria-valuemax={SETUP_STEPS.length}
        >
          <div className="ob-progress-fill" style={{ width: `${progressPct}%` }}>
            <span className="ob-progress-tip" aria-hidden="true" />
          </div>
        </div>
      )}

      {hasSetupChrome && (
        <div className="ob-logo">
          <div className="ob-logo-mark">S+</div>
          <span className="ob-logo-name">
            Sisu<span className="ob-logo-name-plus">+</span>
          </span>
        </div>
      )}

      <div className="ob-content">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={step}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={stepTransition}
          >
            {step === 'title' && <TitleStep onNext={() => goTo('welcome')} />}
            {step === 'welcome' && <WelcomeStep onNext={() => goTo('university')} />}
            {step === 'university' && (
              <UniversityStep
                onNext={(config) => {
                  setPendingConfig(config);
                  goTo('permission');
                }}
              />
            )}
            {step === 'permission' && pendingConfig && (
              <PermissionStep
                config={pendingConfig}
                isRe={resumedAtPermission}
                showBack={!resumedAtPermission}
                onBack={() => goTo('university')}
                onGranted={() => goTo('success')}
              />
            )}
            {step === 'success' && pendingConfig && <SuccessStep config={pendingConfig} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {hasSetupChrome && (
        <div className="ob-step-dots" aria-hidden="true">
          {SETUP_STEPS.map((setupStep, index) => (
            <span
              className={['ob-step-dot', index < setupStepIndex ? 'is-done' : '', setupStep === step ? 'is-active' : '']
                .filter(Boolean)
                .join(' ')}
              key={setupStep}
            />
          ))}
        </div>
      )}
    </div>
  );
}
