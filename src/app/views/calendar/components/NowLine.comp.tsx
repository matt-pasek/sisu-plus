import React from 'react';

interface Props {
  top: number;
}

export const NowLine: React.FC<Props> = ({ top }) => (
  <div
    aria-hidden="true"
    className="pointer-events-none absolute right-0 -left-px z-10 h-0.5 bg-lighterGreen shadow-[0_0_10px_rgba(82,201,137,0.55)]"
    style={{ top }}
  >
    <span className="absolute -top-[3px] -left-1 size-2 rounded-full bg-lighterGreen" />
  </div>
);
