import React from 'react';
import type { ShapeLane, ShapeSegment } from '@/app/schedule';
import { getModuleColorValueByIndex } from '@/app/theme/moduleColors';

const LANE_CLASS: Record<ShapeLane, string> = {
  full: 'top-0.5 h-3',
  top: 'top-0.5 h-[5px]',
  bottom: 'top-2 h-1.5',
};

interface Props {
  segments: ShapeSegment[];
}

export const DayShapeStrip: React.FC<Props> = ({ segments }) => (
  <span aria-hidden="true" className="relative mt-0.5 mb-1 block h-4 overflow-hidden rounded bg-offwhite/3">
    {segments.map((segment) => (
      <span
        key={segment.sessionId}
        className={`absolute rounded-[3px] opacity-85 ${LANE_CLASS[segment.lane]} ${segment.clashing ? 'outline-[1.5px] outline-warn outline-solid' : ''}`}
        style={{
          left: `${segment.left * 100}%`,
          width: `${segment.width * 100}%`,
          backgroundColor: getModuleColorValueByIndex(segment.colorIndex),
        }}
      />
    ))}
  </span>
);
