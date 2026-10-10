import React from 'react';
import { formatWeekday } from '../util';

interface Props {
  dateKey: string;
  isToday: boolean;
  locale: string;
}

export const WeekDayHeader: React.FC<Props> = ({ dateKey, isToday, locale }) => (
  <div className="flex items-baseline gap-2 border-l border-border px-2.5 pt-2.5 pb-2 text-xs text-lightGrey">
    <span>{formatWeekday(dateKey, locale)}</span>
    <span
      className={`text-base font-semibold tabular-nums ${isToday ? 'rounded-lg bg-accent px-[7px] text-white' : 'text-offwhite'}`}
    >
      {Number(dateKey.slice(8, 10))}
    </span>
  </div>
);
