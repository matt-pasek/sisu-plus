import React from 'react';

interface Props {
  hours: number[];
  hourHeight: number;
  nowLabel: { top: number; text: string } | null;
}

export const HourGutter: React.FC<Props> = ({ hours, hourHeight, nowLabel }) => (
  <div aria-hidden="true" className="relative">
    {hours.map((hour, index) => (
      <div
        key={hour}
        className={`pr-2 text-right font-mono text-[10px] text-lightGrey tabular-nums ${index === 0 ? 'translate-y-[3px]' : '-translate-y-[7px]'}`}
        style={{ height: hourHeight }}
      >
        {`${String(hour).padStart(2, '0')}.00`}
      </div>
    ))}
    {nowLabel && (
      <span
        className="absolute right-1 z-10 -translate-y-1/2 rounded bg-lighterGreen px-1 py-px font-mono text-[9.5px] font-semibold text-background tabular-nums"
        style={{ top: nowLabel.top }}
      >
        {nowLabel.text}
      </span>
    )}
  </div>
);
