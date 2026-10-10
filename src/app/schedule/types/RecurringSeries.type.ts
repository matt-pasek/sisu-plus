import type { RecurrenceRule } from './RecurrenceRule.type';
import type { SeriesOccurrence } from './SeriesOccurrence.type';

export interface RecurringSeries {
  id: string;
  startTime: string;
  duration: string;
  recursEvery: RecurrenceRule;
  recursUntil?: string;
  exceptions?: string[];
  cancellations?: string[];
  locationIds?: string[];
  occurrences?: SeriesOccurrence[];
}
