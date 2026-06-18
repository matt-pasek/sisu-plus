import React, { useEffect, useState } from 'react';
import i18n from '@/app/i18n';
import type { LandingLocale } from '@/landing/data/translations';
import { HeroShowcase } from '@landing/components/HeroShowcase';

interface Props {
  locale: LandingLocale;
}

export const HeroShowcaseIsland: React.FC<Props> = ({ locale }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    void i18n.changeLanguage(locale).finally(() => {
      if (isMounted) {
        setIsReady(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [locale]);

  if (!isReady) {
    return null;
  }

  return <HeroShowcase />;
};

export default HeroShowcaseIsland;
