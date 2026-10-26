import type { PeriodCreditSummary } from '@/app/api/dataPoints/getCreditsByPeriod';
import type { PeriodLoad, PlanSpan } from '@/app/views/timeline/types';

export const sumCredits = (values: number[]): number => values.reduce((total, value) => total + value, 0);

export const roundCredits = (value: number): number => Math.round(value * 10) / 10;

const roundCreditsUp = (value: number): number => Math.ceil(Number((value * 10).toFixed(6))) / 10;

const hasCredits = (summary: PeriodCreditSummary): boolean =>
  summary.completedCredits > 0 || summary.plannedCredits > 0;

export const hasEnded = (summary: PeriodCreditSummary, today: string): boolean => summary.period.endDate <= today;

export const getPlanSpan = (sorted: PeriodCreditSummary[]): PlanSpan | null => {
  const withCredits = sorted.filter(hasCredits);
  if (withCredits.length === 0) return null;
  return { from: withCredits[0].period, to: withCredits[withCredits.length - 1].period };
};

export const getRemainingPeriods = (
  sorted: PeriodCreditSummary[],
  today: string,
  lastLocator: string | null,
): PeriodCreditSummary[] => {
  const lastIndex = sorted.findIndex((summary) => summary.periodLocator === lastLocator);
  if (lastIndex === -1) return [];
  return sorted
    .slice(0, lastIndex + 1)
    .filter((summary) => !hasEnded(summary, today))
    .filter((summary) => summary.period.visibleByDefault || summary.plannedCredits > 0);
};

export const getHeaviestPeriod = (sorted: PeriodCreditSummary[], today: string): PeriodLoad | null =>
  sorted.reduce<PeriodLoad | null>(
    (best, summary) =>
      !hasEnded(summary, today) && summary.plannedCredits > (best?.credits ?? 0)
        ? { period: summary.period, credits: roundCredits(summary.plannedCredits), isPast: false }
        : best,
    null,
  );

export const getAveragePace = (remaining: PeriodCreditSummary[]): number | null =>
  remaining.length === 0
    ? null
    : roundCredits(sumCredits(remaining.map((summary) => summary.plannedCredits)) / remaining.length);

export const getNeededPerPeriod = (target: number | null, earned: number, remainingCount: number): number | null => {
  if (target === null || remainingCount === 0 || earned >= target) return null;
  return roundCreditsUp((target - earned) / remainingCount);
};

const isOnChart = (summary: PeriodCreditSummary): boolean => summary.period.visibleByDefault || hasCredits(summary);

export const getChartPeriods = (sorted: PeriodCreditSummary[], span: PlanSpan | null): PeriodCreditSummary[] => {
  if (!span) return [];
  const fromIndex = sorted.findIndex((summary) => summary.periodLocator === span.from.locator);
  const toIndex = sorted.findIndex((summary) => summary.periodLocator === span.to.locator);
  if (fromIndex === -1 || toIndex === -1) return [];
  return sorted.slice(fromIndex, toIndex + 1).filter(isOnChart);
};

export const getEarnedPace = (chartPeriods: PeriodCreditSummary[], today: string): number | null => {
  const ended = chartPeriods.filter((summary) => hasEnded(summary, today));
  return ended.length === 0
    ? null
    : roundCredits(sumCredits(ended.map((summary) => summary.completedCredits)) / ended.length);
};
