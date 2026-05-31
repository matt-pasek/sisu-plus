export type Locale = 'en' | 'fi';

export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALES: Locale[] = ['en', 'fi'];

export function isLocale(value: unknown): value is Locale {
  return value === 'en' || value === 'fi';
}
