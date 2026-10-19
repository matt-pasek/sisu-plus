import type { OverflowSlot } from './OverflowSlot.type';
import type { Placement } from './Placement.type';

export interface DayLayout {
  placements: Record<string, Placement>;
  overflow: OverflowSlot[];
}
