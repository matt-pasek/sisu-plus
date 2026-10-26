import type { TeachingWindow } from './periodFit';

export interface DatedTeachingWindow {
  startDate: string;
  endDate: string;
}

const isDated = (window: TeachingWindow): window is DatedTeachingWindow => !!window.startDate && !!window.endDate;

export const getNextTeachingWindow = (windows: TeachingWindow[], today: string): DatedTeachingWindow | null =>
  windows
    .filter(isDated)
    .filter((window) => window.endDate > today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))[0] ?? null;
