import { getCurrentLocale } from '@/app/i18n';

export const formatPeriodRange = (startDate: string, endDate: string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setDate(end.getDate() - 1);

  const startLabel = start.toLocaleString(getCurrentLocale(), { month: 'short', day: 'numeric' });
  const endLabel = end.toLocaleString(getCurrentLocale(), { month: 'short', day: 'numeric' });
  return `${startLabel} - ${endLabel}`;
};
