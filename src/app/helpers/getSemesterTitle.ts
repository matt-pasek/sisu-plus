import { SemesterCreditSummary } from '@/app/api/dataPoints/getCreditsByPeriod';
import type { StudyPeriodInfo } from '@/app/api/dataPoints/getStudyPeriodMap';
import { getTerm } from '@/app/helpers/getTerm';
import i18n, { I18N_NAMESPACE } from '@/app/i18n';

export const getTermTitle = (period: StudyPeriodInfo) => {
  const { season, year } = getTerm(period);
  return `${i18n.t(`views.timeline.semester.${season}`, { ns: I18N_NAMESPACE })} ${year}`;
};

export const getTermShortTitle = (period: StudyPeriodInfo) => {
  const { season, year } = getTerm(period);
  return `${i18n.t(`views.timeline.semester.${season}Short`, { ns: I18N_NAMESPACE })} ${year}`;
};

export const getSemesterTitle = (semester: SemesterCreditSummary) => {
  const firstPeriod = semester.periods[0]?.period;
  return firstPeriod ? getTermTitle(firstPeriod) : semester.termName;
};
