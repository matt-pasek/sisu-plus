import type { RecurringSeries } from './RecurringSeries.type';

export interface LinkedSeries {
  series: RecurringSeries;
  summary: string;
  location: string | null;
}
