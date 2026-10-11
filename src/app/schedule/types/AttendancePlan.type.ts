import type { ClashSkip } from './ClashSkip.type';
import type { Swap } from './Swap.type';

export interface AttendancePlan {
  usual: Record<string, string>;
  swaps: Swap[];
  skips: ClashSkip[];
  dismissed: string[];
}
