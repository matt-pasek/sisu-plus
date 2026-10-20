import type { StudyPeriodInfo } from '@/app/api/dataPoints/getStudyPeriodMap';

export type GraduationOutlook =
  | { kind: 'empty' }
  | { kind: 'met' }
  | { kind: 'open'; endsIn: StudyPeriodInfo }
  | { kind: 'graduating'; period: StudyPeriodInfo }
  | { kind: 'short'; credits: number; endsIn: StudyPeriodInfo };
