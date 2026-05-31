import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { en, I18N_NAMESPACE } from '@/app/locales/en/en';
import { fi } from '@/app/locales/fi/fi';
import { DEFAULT_LOCALE, isLocale, Locale } from '@/app/locales/locale';

const resources = {
  en,
  fi,
} as const;

export { I18N_NAMESPACE };

export function getCurrentLocale(): Locale {
  const language = i18n.resolvedLanguage ?? i18n.language;
  const locale = language?.slice(0, 2);
  return isLocale(locale) ? locale : DEFAULT_LOCALE;
}

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    defaultNS: I18N_NAMESPACE,
    detection: {
      caches: ['localStorage', 'cookie'],
      order: ['localStorage', 'cookie', 'navigator'],
    },
    fallbackLng: DEFAULT_LOCALE,
    interpolation: {
      escapeValue: false,
    },
    ns: [I18N_NAMESPACE],
    resources,
  });

if (typeof chrome !== 'undefined' && chrome.storage?.sync) {
  chrome.storage.sync.get({ locale: DEFAULT_LOCALE }, (stored) => {
    if (isLocale(stored.locale)) void i18n.changeLanguage(stored.locale);
  });
}

export default i18n;
