import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { KNOWN_UNIVERSITIES, universityConfigFromSisuDomain, validateSisuDomain } from '@/app/types/universityConfig';
import type { UniversityConfig } from '@/app/types/universityConfig';
import { OnboardingButton } from '../components/OnboardingButton';
import { OnboardingHeadline } from '../components/OnboardingHeadline';

interface Props {
  onNext: (config: UniversityConfig) => void;
}

function fade(delay: number) {
  return {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const, delay },
  };
}

export function UniversityStep({ onNext }: Props) {
  const { t } = useTranslation();
  const [raw, setRaw] = useState('');
  const [touched, setTouched] = useState(false);

  const validation = validateSisuDomain(raw);
  const errorMsg = touched && raw.length > 0 && !validation.valid ? (validation as { error: string }).error : null;
  const domain = validation.valid ? (validation as { domain: string }).domain : null;
  const config = domain ? universityConfigFromSisuDomain(domain) : null;

  function handleChip(uni: UniversityConfig) {
    setRaw(uni.sisuDomain);
    setTouched(false);
  }

  function handleSubmit() {
    if (config) onNext(config);
  }

  return (
    <div>
      <OnboardingHeadline lines={[t('onboarding.university.headline').split(' ')]} size="clamp(40px, 5.4vw, 76px)" />

      <motion.p className="ob-body" {...fade(0.42)}>
        {t('onboarding.university.body')}
      </motion.p>

      <motion.div className="ob-input-area" {...fade(0.6)}>
        <div className="ob-quick-picks">
          <span className="ob-quick-pick-label">{t('onboarding.university.quickPickLabel')}</span>
          {KNOWN_UNIVERSITIES.map((uni) => (
            <button className="ob-quick-pick" key={uni.sisuDomain} onClick={() => handleChip(uni)} type="button">
              {uni.name}
            </button>
          ))}
        </div>

        <div
          className={`ob-input-underline${errorMsg ? 'is-error' : ''}`}
          role="group"
          aria-label={t('onboarding.university.groupAriaLabel')}
        >
          <input
            aria-label={t('onboarding.university.inputAriaLabel')}
            autoFocus
            autoCapitalize="none"
            autoCorrect="off"
            className="ob-url-input"
            onBlur={() => setTouched(true)}
            onChange={(e) => {
              setRaw(e.target.value);
              setTouched(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && config) handleSubmit();
            }}
            placeholder={t('onboarding.university.inputPlaceholder')}
            spellCheck={false}
            type="text"
            value={raw}
          />
        </div>

        <AnimatePresence>
          {errorMsg && (
            <motion.p
              animate={{ opacity: 1, y: 0 }}
              className="ob-input-error"
              exit={{ opacity: 0, y: -4 }}
              initial={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              {errorMsg}
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {config && !errorMsg && (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="ob-domain-preview"
              exit={{ opacity: 0, y: -8 }}
              initial={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="ob-domain-item">
                <span className="ob-domain-label">Sisu</span>
                <span className="ob-domain-value">{config.sisuDomain}</span>
              </div>
              <div className="ob-domain-item">
                <span className="ob-domain-label">Moodle</span>
                <span className="ob-domain-value">{config.moodleDomain}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div style={{ marginTop: 30 }} {...fade(0.9)}>
        <div className="ob-btn-stack">
          <OnboardingButton disabled={!config} onClick={handleSubmit}>
            {t('onboarding.university.cta')}
          </OnboardingButton>
        </div>
      </motion.div>
    </div>
  );
}
