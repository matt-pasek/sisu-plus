import React from 'react';

interface Props {
  top: number;
  count: number;
}

export const OverflowChip: React.FC<Props> = ({ top, count }) => (
  <span
    className="absolute right-1 z-10 rounded-md bg-container2 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-lightGrey shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
    style={{ top: top + 4 }}
  >
    +{count}
  </span>
);
