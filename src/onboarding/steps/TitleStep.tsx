import { motion } from 'motion/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  onNext: () => void;
}

const titleTransition = {
  duration: 0.8,
  ease: [0.2, 0.8, 0.2, 1] as const,
};

export function TitleStep({ onNext }: Props) {
  const { t } = useTranslation();

  useEffect(() => {
    const timeoutId = window.setTimeout(onNext, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [onNext]);

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="ob-title-step"
      initial={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
    >
      <motion.div
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="ob-title-mark"
        initial={{ opacity: 0, scale: 0.62, y: 12 }}
        transition={{ ...titleTransition, delay: 0.1 }}
      >
        S+
      </motion.div>

      <motion.h1
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        className="ob-title-word"
        initial={{ opacity: 0, y: 18, filter: 'blur(10px)' }}
        transition={{ ...titleTransition, delay: 0.34 }}
      >
        Sisu<span className="ob-title-word-plus">+</span>
      </motion.h1>

      <motion.div
        animate={{ scaleX: 1, opacity: 1 }}
        className="ob-title-rule"
        initial={{ scaleX: 0, opacity: 0 }}
        transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1], delay: 0.58 }}
      />

      <motion.p
        animate={{ opacity: 1, y: 0 }}
        className="ob-title-kicker"
        initial={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1], delay: 0.82 }}
      >
        {t('onboarding.title.kicker')}
      </motion.p>
    </motion.div>
  );
}
