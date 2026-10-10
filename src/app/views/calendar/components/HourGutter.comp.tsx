import React from 'react';

interface Props {
  hours: number[];
  hourHeight: number;
}

export const HourGutter: React.FC<Props> = ({ hours, hourHeight }) => (
  <div aria-hidden="true">
    {hours.map((hour, index) => (
      <div
        key={hour}
        className={`pr-2 text-right font-mono text-[10px] text-lightGrey tabular-nums ${index === 0 ? 'translate-y-[3px]' : '-translate-y-[7px]'}`}
        style={{ height: hourHeight }}
      >
        {`${String(hour).padStart(2, '0')}.00`}
      </div>
    ))}
  </div>
);
