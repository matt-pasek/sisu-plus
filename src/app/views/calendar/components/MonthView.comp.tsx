import React, { useMemo } from 'react';
import type { CalendarData } from '@/app/api/dataPoints/calendar/types';
import type { StudyPeriodInfo } from '@/app/api/dataPoints/getStudyPeriodMap';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { addDaysToDateKey, holidaysInRange, noTeachingWeeks, type Session } from '@/app/schedule';
import { formatWeekday, monthGrid, monthWeeks, roomChangeIds } from '../util';
import { MonthDayCell } from './MonthDayCell.comp';

interface Props {
  data: CalendarData;
  sessionsById: Map<string, Session>;
  monthKey: string;
  todayKey: string;
  periods: StudyPeriodInfo[];
  showCancelled: boolean;
  locale: string;
  onOpenDay: (dateKey: string) => void;
  onOpenWeek: (dateKey: string) => void;
}

export const MonthView: React.FC<Props> = ({
  data,
  sessionsById,
  monthKey,
  todayKey,
  periods,
  showCancelled,
  locale,
  onOpenDay,
  onOpenWeek,
}) => {
  const { t } = useTranslationWithPrefix('views.calendar');
  const weeks = useMemo(() => {
    const grid = monthGrid(monthKey);
    const span = { startKey: grid[0][0], endKey: addDaysToDateKey(grid[grid.length - 1][6], 1) };
    return monthWeeks({
      monthKey,
      todayKey,
      attended: data.attended,
      clashes: data.clashes,
      periods,
      holidays: holidaysInRange(span),
      noTeachingWeeks: noTeachingWeeks(data.attended, periods, data.range),
      roomChangeIds: roomChangeIds(data.attended),
      showCancelled,
    });
  }, [data.attended, data.clashes, data.range, monthKey, todayKey, periods, showCancelled]);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-background">
      <div
        className="grid min-h-full grid-cols-[34px_repeat(5,minmax(0,1fr))_repeat(2,minmax(0,0.55fr))]"
        style={{ gridTemplateRows: `auto repeat(${weeks.length}, minmax(112px, 1fr))` }}
      >
        <div className="sticky top-0 z-10 border-b border-border2 bg-container" />
        {weeks[0].cells.map((cell) => (
          <div
            key={cell.dateKey}
            className="sticky top-0 z-10 border-b border-border2 bg-container px-2.5 py-2 text-xs text-lightGrey"
          >
            {formatWeekday(cell.dateKey, locale)}
          </div>
        ))}
        {weeks.map((week) => (
          <React.Fragment key={week.weekKey}>
            <button
              type="button"
              onClick={() => onOpenWeek(week.weekKey)}
              aria-label={t('month.openWeek', { week: week.weekNumber })}
              className="cursor-pointer border-t border-border pt-2.5 pl-2.5 text-left font-mono text-[10px] text-darkishGrey transition-colors duration-150 hover:text-offwhite"
            >
              {week.weekNumber}
            </button>
            {week.cells.map((cell) => (
              <MonthDayCell
                key={cell.dateKey}
                cell={cell}
                isCurrentWeek={week.isCurrent}
                sessionsById={sessionsById}
                rooms={data.rooms}
                locale={locale}
                onOpen={onOpenDay}
              />
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
