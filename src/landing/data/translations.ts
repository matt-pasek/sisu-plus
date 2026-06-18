import { landingTranslation as landingEn } from '@/app/locales/en/landing/landing.translation.en';
import { landingTranslation as landingFi } from '@/app/locales/fi/landing/landing.translation.fi';

export const landingTranslations = {
  en: landingEn,
  fi: landingFi,
} as const;

export type LandingLocale = keyof typeof landingTranslations;
