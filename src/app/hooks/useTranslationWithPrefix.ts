import { KeyPrefix } from 'i18next';
import { useTranslation } from 'react-i18next';
import { I18N_NAMESPACE } from '@/app/i18n';

export const useTranslationWithPrefix = (
  prefix: KeyPrefix<typeof I18N_NAMESPACE>,
): ReturnType<typeof useTranslation<typeof I18N_NAMESPACE, KeyPrefix<typeof I18N_NAMESPACE>>> => {
  return useTranslation(I18N_NAMESPACE, { keyPrefix: prefix });
};
