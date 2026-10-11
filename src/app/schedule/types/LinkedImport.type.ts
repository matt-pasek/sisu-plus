import type { LinkedSeries } from './LinkedSeries.type';

export interface LinkedImport {
  items: LinkedSeries[];
  total: number;
  matched: number;
  skippedAllDay: number;
  firstOnly: number;
}
