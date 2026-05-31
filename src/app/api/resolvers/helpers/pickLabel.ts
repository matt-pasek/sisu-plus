import { LocalizedString } from '@/app/api/generated/OriApi';
import { getCurrentLocale } from '@/app/i18n';

export const pickLabel = (obj: LocalizedString) => {
  if (!obj) return null;
  const locale = getCurrentLocale();
  return obj[locale] ?? obj.en ?? obj.fi ?? obj.sv ?? null;
};
