import type { PeriodCreditSummary } from '@/app/api/dataPoints/getCreditsByPeriod';
import type { TimelineCourse } from '@/app/api/dataPoints/getTimelineCourses';
import type { StructureData } from '@/app/views/structure/types';
import type { HeroStats } from '@/app/views/timeline/types';
import { getGraduationOutlook } from './heroOutlook';
import {
  getAveragePace,
  getChartPeriods,
  getEarnedPace,
  getHeaviestPeriod,
  hasEnded,
  getNeededPerPeriod,
  getPlanSpan,
  getRemainingPeriods,
  roundCredits,
  sumCredits,
} from './heroPace';

interface HeroStatsArgs {
  periods: PeriodCreditSummary[];
  courses: TimelineCourse[];
  target: number | null;
  today: string;
}

export const getHeroStats = ({ periods, courses, target, today }: HeroStatsArgs): HeroStats => {
  const sorted = [...periods].sort((a, b) => a.period.startDate.localeCompare(b.period.startDate));
  const passedCredits = sumCredits(courses.filter((course) => course.isPassed).map((course) => course.credits ?? 0));
  const scheduledCredits = sumCredits(sorted.map((summary) => summary.plannedCredits));
  const baseline = Math.max(0, passedCredits - sumCredits(sorted.map((summary) => summary.completedCredits)));
  const projectedCredits = roundCredits(passedCredits + scheduledCredits);
  const span = getPlanSpan(sorted);
  const remaining = getRemainingPeriods(sorted, today, span?.to.locator ?? null);
  const chartPeriods = getChartPeriods(sorted, span);
  const earnedPace = getEarnedPace(chartPeriods, today);

  return {
    outlook: getGraduationOutlook({ sorted, baseline, target, today }),
    span,
    scheduledCredits: roundCredits(scheduledCredits),
    projectedCredits,
    projectedPercent: target === null ? null : Math.round((projectedCredits / target) * 100),
    target,
    remainingPeriods: remaining.length,
    loads: chartPeriods.map((summary) => ({
      period: summary.period,
      credits: roundCredits(summary.plannedCredits + summary.completedCredits),
      isPast: hasEnded(summary, today),
    })),
    heaviest: getHeaviestPeriod(sorted, today),
    averagePace: earnedPace ?? getAveragePace(remaining),
    paceKind: earnedPace === null ? 'planned' : 'earned',
    neededPerPeriod: getNeededPerPeriod(target, passedCredits, remaining.length),
  };
};

export const getDegreeTarget = (
  data: Pick<StructureData, 'degreeMinimumCredits' | 'sections'> | undefined,
): number | null => {
  if (!data) return null;
  const target = data.degreeMinimumCredits || sumCredits(data.sections.map((section) => section.minimumCredits));
  return target > 0 ? target : null;
};
