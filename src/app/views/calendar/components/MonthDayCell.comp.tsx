import React from 'react';
import type { RoomInfo } from '@/app/api/dataPoints/calendar/types';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import type { Session } from '@/app/schedule';
import type { MonthCell } from '../types';
import { formatHours, formatSessionDate } from '../util';
import { DayShapeStrip } from './DayShapeStrip.comp';
import { WarningIcon } from './icons';
import { MonthExceptionLine } from './MonthExceptionLine.comp';

interface Props {
  cell: MonthCell;
  isCurrentWeek: boolean;
  sessionsById: Map<string, Session>;
  rooms: Record<string, RoomInfo>;
  locale: string;
  onOpen: (dateKey: string) => void;
}

export const MonthDayCell: React.FC<Props> = ({ cell, isCurrentWeek, sessionsById, rooms, locale, onOpen }) => {
  const { t } = useTranslationWithPrefix('views.calendar');
  const day = Number(cell.dateKey.slice(8, 10));
  const tone = `${cell.isWeekend ? 'bg-offwhite/[0.012]' : ''} ${isCurrentWeek ? 'bg-offwhite/[0.025]' : ''}`;
  const hours = formatHours(cell.minutes, locale);
  const date = formatSessionDate(cell.dateKey, locale);
  return (
    <button
      type="button"
      onClick={() => onOpen(cell.dateKey)}
      className={`flex min-h-[112px] min-w-0 cursor-pointer flex-col gap-[3px] border-t border-l border-border px-2 py-1.5 text-left transition-colors duration-150 hover:bg-offwhite/3 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-lighterGreen ${tone} ${cell.inMonth ? '' : 'opacity-40'}`}
    >
      <span className="sr-only">{date}</span>
      <span className="mb-0.5 flex items-center justify-between gap-1.5">
        <span
          aria-hidden="true"
          className={`text-[13px] font-semibold tabular-nums ${cell.isToday ? 'rounded-[7px] bg-accent px-1.5 text-white' : cell.inMonth ? 'text-offwhite' : 'text-lightGrey'}`}
        >
          {day}
        </span>
        {cell.minutes > 0 && (
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-medium text-lightGrey">
            {cell.hasClash && <WarningIcon className="size-3 text-warn" />}
            {t('month.hours', { hours })}
          </span>
        )}
      </span>
      {cell.shape.length > 0 && <DayShapeStrip segments={cell.shape} />}
      {cell.exceptions.map((exception, index) => (
        <MonthExceptionLine
          key={`${exception.kind}-${index}`}
          exception={exception}
          sessionsById={sessionsById}
          rooms={rooms}
        />
      ))}
    </button>
  );
};
