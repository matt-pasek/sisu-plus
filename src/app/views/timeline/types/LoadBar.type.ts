import type { StudyPeriodInfo } from '@/app/api/dataPoints/getStudyPeriodMap';

export interface LoadBar {
  locator: string;
  period: StudyPeriodInfo;
  tick: string;
  credits: number;
  ratio: number;
  isHeaviest: boolean;
}
