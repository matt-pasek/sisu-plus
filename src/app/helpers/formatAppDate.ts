import { Locale } from '@/app/locales/locale';
import { getCurrentLocale } from '@/app/i18n';

type DateLike = Date | number | string | null | undefined;

const LOCALE_MAP: Record<Locale, string> = {
  en: 'en-GB',
  fi: 'fi-FI',
};

export const formatAppDate = (value: DateLike, fallback = '-'): string => {
  if (value == null || value === '') return fallback;

  let date: Date;
  if (typeof value === 'string') {
    const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    date = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(value);
  } else {
    date = new Date(value);
  }

  if (Number.isNaN(date.getTime())) return fallback;

  return date.toLocaleDateString(LOCALE_MAP[getCurrentLocale()]);
};
