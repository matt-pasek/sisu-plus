import type { ShapeLane } from './ShapeLane.type';

export interface ShapeSegment {
  sessionId: string;
  colorIndex: number;
  left: number;
  width: number;
  lane: ShapeLane;
  clashing: boolean;
}
