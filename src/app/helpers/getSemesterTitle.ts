import { SemesterCreditSummary } from '@/app/api/dataPoints/getCreditsByPeriod';
import type { StudyPeriodInfo } from '@/app/api/dataPoints/getStudyPeriodMap';
import i18n, { I18N_NAMESPACE } from '@/app/i18n';

export const getTermTitle = (period: StudyPeriodInfo) => {
  const month = new Date(period.startDate).getMonth() + 1;
  const season =
    month >= 8
      ? i18n.t('views.timeline.semester.autumn', { ns: I18N_NAMESPACE })
      : i18n.t('views.timeline.semester.spring', { ns: I18N_NAMESPACE });
  const year = month >= 8 ? period.studyYear : period.studyYear + 1;
  return `${season} ${year}`;
};

export const getTermShortTitle = (period: StudyPeriodInfo) => {
  const month = new Date(period.startDate).getMonth() + 1;
  const season =
    month >= 8
      ? i18n.t('views.timeline.semester.autumnShort', { ns: I18N_NAMESPACE })
      : i18n.t('views.timeline.semester.springShort', { ns: I18N_NAMESPACE });
  const year = month >= 8 ? period.studyYear : period.studyYear + 1;
  return `${season} ${String(year).slice(-2)}`;
};

export const getSemesterTitle = (semester: SemesterCreditSummary) => {
  const firstPeriod = semester.periods[0]?.period;
  return firstPeriod ? getTermTitle(firstPeriod) : semester.termName;
};
