import type { StudyPeriodInfo } from '@/app/api/dataPoints/getStudyPeriodMap';
import { rangesOverlap } from '@/app/api/dataPoints/util/dateRanges';

export interface TeachingWindow {
  startDate: string | null;
  endDate: string | null;
}

export type FitCertainty = 'confirmed' | 'likely';

export interface PeriodFit {
  certainty: FitCertainty;
  periodLocators: string[];
}

interface DatedWindow {
  startDate: string;
  endDate: string;
}

const hasDates = (window: TeachingWindow): window is DatedWindow => !!window.startDate && !!window.endDate;

const overlappedPeriods = (window: DatedWindow, periods: StudyPeriodInfo[]): StudyPeriodInfo[] =>
  periods.filter((period) => rangesOverlap(window.startDate, window.endDate, period.startDate, period.endDate));

export const getPeriodFit = (
  realisations: TeachingWindow[],
  periods: StudyPeriodInfo[],
  targetLocator: string,
): PeriodFit | null => {
  const target = periods.find((period) => period.locator === targetLocator);
  if (!target) return null;

  const windows = realisations.filter(hasDates).sort((a, b) => a.startDate.localeCompare(b.startDate));

  const confirmed = windows.find((window) =>
    rangesOverlap(window.startDate, window.endDate, target.startDate, target.endDate),
  );
  if (confirmed) {
    return {
      certainty: 'confirmed',
      periodLocators: overlappedPeriods(confirmed, periods).map((period) => period.locator),
    };
  }

  const likely = [...windows]
    .reverse()
    .find((window) => overlappedPeriods(window, periods).some((period) => period.name === target.name));
  if (!likely) return null;

  const names = new Set(overlappedPeriods(likely, periods).map((period) => period.name));
  const locators = periods
    .filter((period) => period.studyYear === target.studyYear && names.has(period.name))
    .map((period) => period.locator);

  return locators.includes(targetLocator) ? { certainty: 'likely', periodLocators: locators } : null;
};
