import { getRoutePath, LandingRoute } from '@/landing/landingSeo';
import i18n, { getCurrentLocale } from '@/app/i18n';
import { Locale, LOCALES } from '@/app/locales/locale';
import React from 'react';

interface Props {
  route: LandingRoute;
}

export const LanguageToggle: React.FC<Props> = ({ route }) => {
  const activeLocale = getCurrentLocale();

  function setLocale(locale: Locale) {
    localStorage.setItem('i18nextLng', locale);
    void i18n.changeLanguage(locale);

    const nextPath = getRoutePath(locale, route.kind);
    if (window.location.pathname !== nextPath) {
      window.location.assign(nextPath);
    }
  }

  return (
    <div className="flex items-center gap-1 rounded-full border border-border bg-container2 p-1 text-xs font-semibold">
      {LOCALES.map((locale) => (
        <button
          key={locale}
          className={`min-h-7 rounded-full px-2.5 transition-[background-color,color,transform] duration-150 active:scale-[0.96] ${
            activeLocale === locale ? 'bg-lighterGreen text-background' : 'text-lightGrey hover:text-offwhite'
          }`}
          onClick={() => setLocale(locale)}
          type="button"
        >
          {locale.toUpperCase()}
        </button>
      ))}
    </div>
  );
};
