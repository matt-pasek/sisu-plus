import type { TFunction } from 'i18next';

export const getCurrentPeriodLabel = (t: TFunction): string => {
  const m = new Date().getMonth() + 1;
  const y = new Date().getFullYear();
  if (m >= 9)
    return `${t('periodLabel.autumn')} ${y} · ${m >= 11 ? t('periodLabel.secondPeriod') : t('periodLabel.firstPeriod')} ${t('periodLabel.ongoing')}`;
  if (m >= 6) return `${t('periodLabel.summer')} ${y}`;
  if (m >= 3) return `${t('periodLabel.spring')} ${y} · ${t('periodLabel.fourthPeriod')} ${t('periodLabel.ongoing')}`;
  return `${t('periodLabel.spring')} ${y} · ${t('periodLabel.thirdPeriod')} ${t('periodLabel.ongoing')}`;
};

export const getCurrentSemester = (t: TFunction): string => {
  const m = new Date().getMonth() + 1;
  const y = new Date().getFullYear();
  if (m >= 9) return `${t('semesterLabel.autumn')} ${y}`;
  if (m >= 6) return `${t('semesterLabel.summer')} ${y}`;
  return `${t('semesterLabel.spring')} ${y}`;
};
