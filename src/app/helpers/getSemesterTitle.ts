import { SemesterCreditSummary } from '@/app/api/dataPoints/getCreditsByPeriod';
import i18n, { I18N_NAMESPACE } from '@/app/i18n';

export const getSemesterTitle = (semester: SemesterCreditSummary) => {
  const firstPeriod = semester.periods[0]?.period;
  if (!firstPeriod) return semester.termName;

  const month = new Date(firstPeriod.startDate).getMonth() + 1;
  const season =
    month >= 8
      ? i18n.t('views.timeline.semester.autumn', { ns: I18N_NAMESPACE })
      : i18n.t('views.timeline.semester.spring', { ns: I18N_NAMESPACE });
  const year = month >= 8 ? firstPeriod.studyYear : firstPeriod.studyYear + 1;
  return `${season} ${year}`;
};
