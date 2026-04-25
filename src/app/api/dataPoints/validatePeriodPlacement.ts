import type { StudyPeriodMap } from '@/app/api/dataPoints/getStudyPeriodMap';
import type { RealisationResult } from '@/app/api/resolvers/resolveRealization';

export interface PeriodPlacementResult {
  courseUnitId: string;
  targetPeriodLocator: string;
  valid: boolean;
  noData: boolean;
  reason?: string;
}

function rangesOverlap(
  firstStart: string | null,
  firstEnd: string | null,
  secondStart: string,
  secondEnd: string,
): boolean {
  if (!firstStart || !firstEnd) return false;
  return firstStart < secondEnd && firstEnd > secondStart;
}

export function validatePeriodPlacement(
  courseUnitId: string,
  targetPeriodLocator: string,
  realisations: RealisationResult[],
  periodMap: StudyPeriodMap,
): PeriodPlacementResult {
  const period = periodMap.get(targetPeriodLocator);

  if (!period) {
    return {
      courseUnitId,
      targetPeriodLocator,
      valid: false,
      noData: false,
      reason: 'Unknown study period.',
    };
  }

  if (realisations.length === 0) {
    return {
      courseUnitId,
      targetPeriodLocator,
      valid: true,
      noData: true,
      reason: 'No course realisation data available.',
    };
  }

  const offered = realisations.some((realisation) =>
    rangesOverlap(realisation.startDate, realisation.endDate, period.startDate, period.endDate),
  );

  return {
    courseUnitId,
    targetPeriodLocator,
    valid: offered,
    noData: false,
    reason: offered ? undefined : 'No course realisation overlaps the target period.',
  };
}
