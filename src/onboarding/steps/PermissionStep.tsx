import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import type { UniversityConfig } from '@/app/types/universityConfig';
import { OnboardingButton } from '../components/OnboardingButton';
import { OnboardingHeadline } from '../components/OnboardingHeadline';

interface Props {
  config: UniversityConfig;
  onGranted: () => void;
  onBack: () => void;
  showBack?: boolean;
  isRe?: boolean;
}

type Status = 'idle' | 'requesting' | 'denied';

function fade(delay: number) {
  return {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const, delay },
  };
}

function ShieldIcon({ granted }: { granted: boolean }) {
  return (
    <svg fill="none" height="28" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24" width="28">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
      {granted && (
        <motion.path
          animate={{ pathLength: 1, opacity: 1 }}
          d="M9 12l2 2 4-4"
          initial={{ pathLength: 0, opacity: 0 }}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        />
      )}
    </svg>
  );
}

export function PermissionStep({ config, onGranted, onBack, showBack = true, isRe = false }: Props) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<Status>('idle');
  const [granted, setGranted] = useState(false);

  async function requestPermission() {
    setStatus('requesting');
    try {
      const ok = await chrome.permissions.request({
        origins: [`${config.sisuOrigin}/*`, `${config.moodleOrigin}/*`],
      });

      if (ok) {
        setGranted(true);
        await chrome.storage.sync.set({ universityConfig: config });
        setTimeout(onGranted, 420);
      } else {
        setStatus('denied');
      }
    } catch {
      setStatus('denied');
    }
  }

  const headlineKey = isRe ? 'onboarding.permission.headlineRe' : 'onboarding.permission.headline';
  const body = isRe
    ? t('onboarding.permission.bodyRe', { domain: config.sisuDomain })
    : t('onboarding.permission.body');

  const ctaLabel =
    status === 'denied'
      ? t('onboarding.permission.ctaTryAgain')
      : granted
        ? t('onboarding.permission.ctaGranted')
        : t('onboarding.permission.ctaAllow');

  return (
    <div>
      <motion.div className="ob-shield-wrap" {...fade(0.05)}>
        <ShieldIcon granted={granted} />
      </motion.div>

      <OnboardingHeadline lines={[t(headlineKey).split(' ')]} size="clamp(40px, 5.4vw, 76px)" />

      <motion.p className="ob-body" style={{ marginBottom: 28 }} {...fade(0.4)}>
        {body}
      </motion.p>

      <motion.div className="ob-permission-domains" {...fade(0.56)}>
        <div className="ob-permission-domain-row">
          <span className="ob-permission-dot" />
          <span>{config.sisuDomain}</span>
        </div>
        <div className="ob-permission-domain-row">
          <span className="ob-permission-dot" />
          <span>{config.moodleDomain}</span>
        </div>
      </motion.div>

      <AnimatePresence>
        {status === 'denied' && (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="ob-permission-error"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {t('onboarding.permission.denied')}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div {...fade(0.95)}>
        <div className="ob-btn-stack">
          <OnboardingButton disabled={status === 'requesting' || granted} onClick={requestPermission}>
            {ctaLabel}
          </OnboardingButton>
          {showBack && (
            <OnboardingButton onClick={onBack} variant="ghost">
              {t('onboarding.permission.back')}
            </OnboardingButton>
          )}
        </div>
      </motion.div>
    </div>
  );
}
