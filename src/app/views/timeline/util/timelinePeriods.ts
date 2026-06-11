import type { StudyPeriodInfo } from '@/app/api/dataPoints/getStudyPeriodMap';
import { PeriodCreditSummary } from '@/app/api/dataPoints/getCreditsByPeriod';
import { isTimelineCourseDragData, isTimelineDropData } from '@/app/views/timeline/util';

export const getSortedPeriods = (periodMap: Map<string, StudyPeriodInfo>) =>
  [...periodMap.values()].sort((first, second) => first.startDate.localeCompare(second.startDate));

export const isPastPeriod = (period: PeriodCreditSummary, today = new Date().toISOString().slice(0, 10)) =>
  period.period.endDate <= today;

export const isPeriodVisible = (
  period: PeriodCreditSummary,
  { hidePreviousPeriods, showHiddenSummerPeriods }: { hidePreviousPeriods: boolean; showHiddenSummerPeriods: boolean },
) => {
  if (hidePreviousPeriods && isPastPeriod(period)) return false;
  if (showHiddenSummerPeriods) return true;
  return period.period.visibleByDefault || period.courses.some((course) => !course.isPassed);
};

export const getTargetPeriodLocators = (
  periodLocator: string,
  periodCount: number,
  periodMap: Map<string, StudyPeriodInfo>,
) => {
  const periods = getSortedPeriods(periodMap);
  const targetIndex = periods.findIndex((period) => period.locator === periodLocator);
  if (targetIndex < 0) return [periodLocator];

  const duration = Math.min(Math.max(periodCount, 1), periods.length);
  const startIndex = Math.min(targetIndex, Math.max(periods.length - duration, 0));

  return periods.slice(startIndex, startIndex + duration).map((period) => period.locator);
};

export const getMoveLocators = (sourceData: unknown, targetData: unknown, periodMap: Map<string, StudyPeriodInfo>) => {
  if (!isTimelineCourseDragData(sourceData) || !isTimelineDropData(targetData)) return null;
  if (targetData.kind === 'timeline-pool') return [];
  return getTargetPeriodLocators(targetData.periodLocator, sourceData.periodCount, periodMap);
};
