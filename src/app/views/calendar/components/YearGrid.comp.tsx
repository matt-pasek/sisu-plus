import React from 'react';
import type { YearBand, YearWeek } from '../types';
import { formatWeekday } from '../util';
import { YearDayCell } from './YearDayCell.comp';

const WEEKDAY_ROWS = [0, 1, 2, 3, 4];
const FIRST_DAY_ROW = 4;
const MIN_LABELLED_WEEKS = 3;
const BAND =
  'mb-0.5 flex h-5 items-center overflow-hidden rounded-md px-1.5 font-mono text-[10px] font-semibold whitespace-nowrap';

const columnOf = (band: YearBand): React.CSSProperties => ({ gridColumn: `${band.from + 2} / ${band.to + 3}` });

interface Props {
  weeks: YearWeek[];
  months: YearBand[];
  periods: YearBand[];
  gaps: YearBand[];
  locale: string;
  onOpenWeek: (dateKey: string) => void;
}

export const YearGrid: React.FC<Props> = ({ weeks, months, periods, gaps, locale, onOpenWeek }) => (
  <div className="overflow-x-auto px-[18px] pt-4 pb-1.5">
    <div
      className="grid min-w-[760px] items-center gap-1"
      style={{ gridTemplateColumns: `34px repeat(${weeks.length}, minmax(0, 1fr))` }}
    >
      {months.map((band) => (
        <span
          key={`month-${band.from}`}
          className="font-mono text-[10px] whitespace-nowrap text-lightGrey"
          style={{ gridRow: 1, ...columnOf(band) }}
        >
          {band.label}
        </span>
      ))}
      {periods.map((band) => (
        <span
          key={`period-${band.from}`}
          title={band.label}
          className={`${BAND} bg-offwhite/6 text-offwhite`}
          style={{ gridRow: 2, ...columnOf(band) }}
        >
          {band.label}
        </span>
      ))}
      {gaps.map((band) => (
        <span
          key={`gap-${band.from}`}
          title={band.label}
          className={`${BAND} bg-warn/8 text-warn`}
          style={{ gridRow: 3, ...columnOf(band) }}
        >
          {band.to - band.from + 1 >= MIN_LABELLED_WEEKS && band.label}
        </span>
      ))}
      {WEEKDAY_ROWS.map((dayIndex) => (
        <React.Fragment key={dayIndex}>
          <span
            className="font-mono text-[10px] text-lightGrey"
            style={{ gridRow: dayIndex + FIRST_DAY_ROW, gridColumn: 1 }}
          >
            {formatWeekday(weeks[0].days[dayIndex].dateKey, locale)}
          </span>
          {weeks.map((week, weekIndex) => (
            <YearDayCell
              key={week.days[dayIndex].dateKey}
              day={week.days[dayIndex]}
              isCurrentWeek={week.isCurrent}
              locale={locale}
              style={{ gridRow: dayIndex + FIRST_DAY_ROW, gridColumn: weekIndex + 2 }}
              onOpen={onOpenWeek}
            />
          ))}
        </React.Fragment>
      ))}
    </div>
  </div>
);
