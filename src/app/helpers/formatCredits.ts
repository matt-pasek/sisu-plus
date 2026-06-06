import i18n, { I18N_NAMESPACE } from '@/app/i18n';

export const formatCredits = (credits: number | null): string =>
  credits == null ? '-' : `${credits} ${i18n.t('util.credits.short', { ns: I18N_NAMESPACE })}`;
