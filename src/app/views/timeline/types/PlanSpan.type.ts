import type { StudyPeriodInfo } from '@/app/api/dataPoints/getStudyPeriodMap';

export interface PlanSpan {
  from: StudyPeriodInfo;
  to: StudyPeriodInfo;
}
