import { motion } from 'motion/react';
import { Trans, useTranslation } from 'react-i18next';
import { OnboardingButton } from '../components/OnboardingButton';
import { OnboardingHeadline } from '../components/OnboardingHeadline';

interface Props {
  onNext: () => void;
}

function fade(delay: number) {
  return {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const, delay },
  };
}

export function WelcomeStep({ onNext }: Props) {
  const { t } = useTranslation();

  const line1 = t('onboarding.welcome.headlineLine1').split(' ');
  const line2Words = t('onboarding.welcome.headlineLine2').split(' ');
  const line2 = [
    ...line2Words.slice(0, -1),
    { text: line2Words[line2Words.length - 1], color: 'var(--accent-bright)' },
  ];

  return (
    <div>
      <OnboardingHeadline lines={[line1, line2]} size="clamp(46px, 6.6vw, 92px)" />

      <motion.p className="ob-body" {...fade(0.62)}>
        <Trans i18nKey="onboarding.welcome.body" components={{ bold: <strong /> }} />
      </motion.p>

      <motion.div {...fade(0.92)}>
        <div className="ob-btn-stack">
          <OnboardingButton onClick={onNext}>{t('onboarding.welcome.cta')}</OnboardingButton>
        </div>
      </motion.div>
    </div>
  );
}
