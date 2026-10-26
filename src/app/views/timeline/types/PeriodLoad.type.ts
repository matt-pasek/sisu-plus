import type { StudyPeriodInfo } from '@/app/api/dataPoints/getStudyPeriodMap';

export interface PeriodLoad {
  period: StudyPeriodInfo;
  credits: number;
  isPast: boolean;
}
