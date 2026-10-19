import type { StudyPeriodInfo } from '@/app/api/dataPoints/getStudyPeriodMap';
import type { TrajectoryPoint } from './heroStats';

export interface TermPoint {
  key: string;
  period: StudyPeriodInfo;
  total: number;
  hasStarted: boolean;
}

export const getTermPoints = (
  trajectory: TrajectoryPoint[],
  periodsByLocator: Map<string, StudyPeriodInfo>,
): TermPoint[] =>
  trajectory.reduce<TermPoint[]>((terms, point) => {
    const period = periodsByLocator.get(point.periodLocator);
    if (!period) return terms;
    const key = `${period.studyYear}:${period.termName}`;
    const existing = terms.find((term) => term.key === key);
    const next: TermPoint = {
      key,
      period,
      total: point.total,
      hasStarted: point.hasStarted || (existing?.hasStarted ?? false),
    };
    return existing ? terms.map((term) => (term.key === key ? next : term)) : [...terms, next];
  }, []);

export const getChartDomain = (totals: number[], target: number | null): { min: number; max: number } => {
  if (totals.length === 0) return { min: 0, max: target ?? 1 };
  const first = totals[0];
  const max = Math.max(target ?? 0, totals[totals.length - 1]) * 1.04;
  const min = Math.max(0, first - 0.15 * (max - first));
  return max <= min ? { min, max: min + 1 } : { min, max };
};

export const getGraduationX = (points: { x: number; total: number }[], target: number): number | null => {
  const index = points.findIndex((point) => point.total >= target);
  if (index === -1) return null;
  if (index === 0) return points[0].x;
  const before = points[index - 1];
  const after = points[index];
  const ratio = (target - before.total) / (after.total - before.total);
  return before.x + ratio * (after.x - before.x);
};
