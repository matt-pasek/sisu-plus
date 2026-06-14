import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import type { UniversityConfig } from '@/app/types/universityConfig';
import { OnboardingButton } from '../components/OnboardingButton';
import { OnboardingHeadline } from '../components/OnboardingHeadline';

interface Props {
  config: UniversityConfig;
}

function fade(delay: number) {
  return {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const, delay },
  };
}

export function SuccessStep({ config }: Props) {
  const { t } = useTranslation();

  return (
    <div className="ob-success-scene">
      <motion.div
        animate={{ scale: 1, opacity: 1 }}
        className="ob-success-check"
        initial={{ scale: 0.7, opacity: 0 }}
        transition={{ type: 'spring', duration: 0.55, bounce: 0.2 }}
      >
        <svg fill="none" height="80" viewBox="0 0 80 80" width="80">
          <circle
            cx="40"
            cy="40"
            fill="rgba(65, 150, 72, 0.08)"
            r="38"
            stroke="rgba(65, 150, 72, 0.2)"
            strokeWidth="1"
          />
          <motion.circle
            animate={{ pathLength: 1, opacity: 1 }}
            cx="40"
            cy="40"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            r="38"
            stroke="rgba(82, 201, 137, 0.35)"
            strokeWidth="1"
            strokeLinecap="round"
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
          />
          <motion.path
            animate={{ pathLength: 1, opacity: 1 }}
            d="M25 41l11 11 19-22"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            stroke="#52c989"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
          />
        </svg>
      </motion.div>

      <OnboardingHeadline
        className="ob-word-headline-center"
        lines={[
          [
            { text: t('onboarding.success.headlineWord1'), color: 'var(--text)' },
            { text: t('onboarding.success.headlineWord2'), color: 'var(--accent-bright)' },
          ],
        ]}
        size="clamp(46px, 6.4vw, 90px)"
        baseDelay={0.15}
      />

      <motion.p className="ob-body" {...fade(0.5)}>
        {t('onboarding.success.body')}
      </motion.p>

      <motion.div className="ob-success-domain" {...fade(0.66)}>
        {config.sisuDomain}
      </motion.div>

      <motion.div className="ob-success-actions" {...fade(0.84)}>
        <div className="ob-btn-stack">
          <OnboardingButton
            onClick={() => {
              window.location.href = config.sisuOrigin;
            }}
          >
            {t('onboarding.success.openSisu')}
          </OnboardingButton>
          <OnboardingButton onClick={() => window.close()} variant="text">
            {t('onboarding.success.close')}
          </OnboardingButton>
        </div>
      </motion.div>
    </div>
  );
}
