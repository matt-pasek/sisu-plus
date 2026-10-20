import type { StudyPeriodInfo } from '@/app/api/dataPoints/getStudyPeriodMap';
import type { Term } from '@/app/types/Term.type';

const AUTUMN_FIRST_MONTH = 8;

export const getTerm = ({ startDate, studyYear }: Pick<StudyPeriodInfo, 'startDate' | 'studyYear'>): Term =>
  Number(startDate.slice(5, 7)) >= AUTUMN_FIRST_MONTH
    ? { season: 'autumn', year: studyYear }
    : { season: 'spring', year: studyYear + 1 };
