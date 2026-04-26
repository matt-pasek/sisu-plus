import { LocalizedString } from '@/app/api/generated/OriApi';

export const pickLabel = (obj: LocalizedString) => {
  if (!obj) return null;
  return obj.en ?? obj.fi ?? obj.sv ?? null;
};
