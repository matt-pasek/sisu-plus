import { getCurrentLocale } from '@/app/i18n';

export const formatCompactDate = (value: string): string =>
  new Date(value).toLocaleDateString(getCurrentLocale(), { month: 'short', year: '2-digit' });
