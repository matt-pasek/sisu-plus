import type { GraduationOutlook } from './GraduationOutlook.type';
import type { PeriodLoad } from './PeriodLoad.type';
import type { PlanSpan } from './PlanSpan.type';

export interface HeroStats {
  outlook: GraduationOutlook;
  span: PlanSpan | null;
  scheduledCredits: number;
  projectedCredits: number;
  projectedPercent: number | null;
  target: number | null;
  remainingPeriods: number;
  loads: PeriodLoad[];
  heaviest: PeriodLoad | null;
  averagePace: number | null;
  neededPerPeriod: number | null;
}
