import { getHelsinkiParts } from '@/app/schedule';

const intlLocale = (locale: string): string => (locale.startsWith('fi') ? 'fi-FI' : 'en-GB');

const pad = (value: number): string => String(value).padStart(2, '0');

const noonUtc = (dateKey: string): Date => new Date(`${dateKey}T12:00:00.000Z`);

export const formatClock = (instant: Date): string => {
  const { hour, minute } = getHelsinkiParts(instant);
  return `${pad(hour)}.${pad(minute)}`;
};

export const formatWeekday = (dateKey: string, locale: string): string =>
  new Intl.DateTimeFormat(intlLocale(locale), { weekday: 'short', timeZone: 'UTC' }).format(noonUtc(dateKey));

export const formatWeekdayNarrow = (dateKey: string, locale: string): string =>
  new Intl.DateTimeFormat(intlLocale(locale), { weekday: 'narrow', timeZone: 'UTC' }).format(noonUtc(dateKey));

export const formatSessionDate = (dateKey: string, locale: string): string =>
  `${formatWeekday(dateKey, locale)} ${Number(dateKey.slice(8, 10))}.${Number(dateKey.slice(5, 7))}`;

export const formatWeekRange = (firstKey: string, lastKey: string, locale: string): string => {
  const options: Intl.DateTimeFormatOptions = locale.startsWith('fi')
    ? { day: 'numeric', month: 'numeric', timeZone: 'UTC' }
    : { day: 'numeric', month: 'short', timeZone: 'UTC' };
  const formatter = new Intl.DateTimeFormat(intlLocale(locale), options);
  return `${formatter.format(noonUtc(firstKey))} – ${formatter.format(noonUtc(lastKey))}`;
};

export const formatMonthTitle = (monthKey: string, locale: string): string => {
  const text = new Intl.DateTimeFormat(intlLocale(locale), { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    noonUtc(monthKey),
  );
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const joinNames = (names: string[], locale: string): string =>
  new Intl.ListFormat(intlLocale(locale), { style: 'long', type: 'conjunction' }).format(names);
