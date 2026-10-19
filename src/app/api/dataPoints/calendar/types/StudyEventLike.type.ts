import type { RecurrenceRule } from '@/app/schedule';
import type { LocalizedText } from './LocalizedText.type';

export interface StudyEventLike {
  id?: string;
  name?: LocalizedText;
  startTime: string;
  duration: string;
  recursEvery: RecurrenceRule;
  recursUntil?: string | null;
  exceptions?: string[];
  cancellations?: string[];
  locationIds?: string[];
  events?: {
    start?: string;
    end?: string;
    duration?: string;
    excluded?: boolean;
    cancelled?: boolean;
    irregularLocationIds?: string[] | null;
    notice?: LocalizedText | null;
  }[];
}
