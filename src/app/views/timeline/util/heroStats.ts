import type { PeriodCreditSummary } from '@/app/api/dataPoints/getCreditsByPeriod';
import type { StudyPeriodInfo } from '@/app/api/dataPoints/getStudyPeriodMap';
import type { TimelineCourse } from '@/app/api/dataPoints/getTimelineCourses';
import type { StructureData } from '@/app/views/structure/types';

export interface TrajectoryPoint {
  periodLocator: string;
  completed: number;
  total: number;
  hasStarted: boolean;
}

export type GraduationEstimate =
  | { kind: 'period'; period: StudyPeriodInfo }
  | { kind: 'short'; credits: number }
  | null;

export interface HeroStats {
  scheduledCredits: number;
  heaviest: { period: StudyPeriodInfo; credits: number } | null;
  graduation: GraduationEstimate;
  trajectory: TrajectoryPoint[];
  target: number | null;
}

interface HeroStatsArgs {
  periods: PeriodCreditSummary[];
  courses: TimelineCourse[];
  target: number | null;
  today: string;
}

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

const hasCredits = (summary: PeriodCreditSummary) => summary.completedCredits > 0 || summary.plannedCredits > 0;

const getHeaviest = (sorted: PeriodCreditSummary[], today: string): HeroStats['heaviest'] =>
  sorted.reduce<HeroStats['heaviest']>(
    (best, { period, plannedCredits }) =>
      period.endDate >= today && plannedCredits > (best?.credits ?? 0) ? { period, credits: plannedCredits } : best,
    null,
  );

const getTrajectory = (sorted: PeriodCreditSummary[], baseline: number, today: string): TrajectoryPoint[] => {
  const first = sorted.findIndex(hasCredits);
  if (first === -1) return [];
  const last = sorted.length - 1 - [...sorted].reverse().findIndex(hasCredits);

  return sorted.slice(first, last + 1).reduce<{ points: TrajectoryPoint[]; completed: number; planned: number }>(
    (acc, summary) => {
      const completed = acc.completed + summary.completedCredits;
      const planned = acc.planned + summary.plannedCredits;
      const point: TrajectoryPoint = {
        periodLocator: summary.periodLocator,
        completed: baseline + completed,
        total: baseline + completed + planned,
        hasStarted: summary.period.startDate <= today,
      };
      return { points: [...acc.points, point], completed, planned };
    },
    { points: [], completed: 0, planned: 0 },
  ).points;
};

const getGraduation = (
  trajectory: TrajectoryPoint[],
  sorted: PeriodCreditSummary[],
  baseline: number,
  target: number | null,
): GraduationEstimate => {
  if (target === null) return null;
  const reached = trajectory.find((point) => point.total >= target);
  const period = reached && sorted.find((summary) => summary.periodLocator === reached.periodLocator)?.period;
  if (period) return { kind: 'period', period };
  const finalTotal = trajectory.length > 0 ? trajectory[trajectory.length - 1].total : baseline;
  return { kind: 'short', credits: Math.max(0, target - finalTotal) };
};

export const getHeroStats = ({ periods, courses, target, today }: HeroStatsArgs): HeroStats => {
  const sorted = [...periods].sort((a, b) => a.period.startDate.localeCompare(b.period.startDate));
  const passedCredits = sum(courses.filter((course) => course.isPassed).map((course) => course.credits ?? 0));
  const baseline = Math.max(0, passedCredits - sum(periods.map((summary) => summary.completedCredits)));
  const trajectory = getTrajectory(sorted, baseline, today);

  return {
    scheduledCredits: sum(periods.map((summary) => summary.plannedCredits)),
    heaviest: getHeaviest(sorted, today),
    graduation: getGraduation(trajectory, sorted, baseline, target),
    trajectory,
    target,
  };
};

export const getDegreeTarget = (
  data: Pick<StructureData, 'degreeMinimumCredits' | 'sections'> | undefined,
): number | null => {
  if (!data) return null;
  const target = data.degreeMinimumCredits || sum(data.sections.map((section) => section.minimumCredits));
  return target > 0 ? target : null;
};
