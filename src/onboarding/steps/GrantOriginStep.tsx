import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { TIMETABLE_GRANT_KEY } from '@/shared/timetables/timetables';
import Aurora from '../components/Aurora';
import { OnboardingButton } from '../components/OnboardingButton';
import { OnboardingHeadline } from '../components/OnboardingHeadline';

const AURORA_STOPS: string[] = ['#4cd696', '#2ea36b', '#34d3c3'];
const CLOSE_DELAY_MS = 900;

interface Props {
  origin: string;
}

export const GrantOriginStep: React.FC<Props> = ({ origin }) => {
  const { t } = useTranslation();
  const [status, setStatus] = useState<'idle' | 'granted' | 'denied'>('idle');
  const host = new URL(origin).host;

  const allow = async () => {
    const granted = await chrome.permissions.request({ origins: [`${origin}/*`] }).catch(() => false);
    if (!granted) {
      setStatus('denied');
      return;
    }
    setStatus('granted');
    await chrome.storage.local.set({ [TIMETABLE_GRANT_KEY]: { origin, at: Date.now() } });
    window.setTimeout(() => window.close(), CLOSE_DELAY_MS);
  };

  return (
    <div className="ob-page">
      <div className="ob-aurora-bg" aria-hidden>
        <Aurora colorStops={AURORA_STOPS} amplitude={1.0} speed={0.5} blend={0.6} />
      </div>
      <div className="ob-content">
        <OnboardingHeadline lines={[t('onboarding.grant.headline').split(' ')]} size="clamp(40px, 5.4vw, 76px)" />
        <motion.p className="ob-body" style={{ marginBottom: 28 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {status === 'granted' ? t('onboarding.grant.done') : t('onboarding.grant.body', { host })}
        </motion.p>
        <div className="ob-permission-domains">
          <div className="ob-permission-domain-row">
            <span className="ob-permission-dot" />
            <span>{host}</span>
          </div>
        </div>
        {status === 'denied' && <div className="ob-permission-error">{t('onboarding.grant.denied')}</div>}
        <div className="ob-btn-stack">
          <OnboardingButton disabled={status === 'granted'} onClick={() => void allow()}>
            {t('onboarding.grant.cta')}
          </OnboardingButton>
        </div>
      </div>
    </div>
  );
};
