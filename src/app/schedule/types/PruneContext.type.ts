import type { DateRange } from './DateRange.type';

export interface PruneContext {
  range: DateRange;
  sessionIds: Set<string>;
  visibleGroupIds: Set<string>;
  seriesKeys: Set<string>;
  overlappingPairs: Set<string>;
  clashIds: Set<string>;
}
