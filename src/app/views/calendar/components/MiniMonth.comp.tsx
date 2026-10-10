import React, { useEffect, useMemo, useState } from 'react';
import { Panel } from '@/app/components/ui/Panel.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { addMonthsToDateKey, isoWeekNumber, startOfWeekKey } from '@/app/schedule';
import { formatMonthTitle, formatWeekdayNarrow, monthGrid, monthStartKey } from '../util';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

interface Props {
  anchorKey: string;
  todayKey: string;
  busyDateKeys: Set<string>;
  locale: string;
  onSelect: (dateKey: string) => void;
}

const navButton =
  'inline-flex size-6 cursor-pointer items-center justify-center rounded-md text-lightGrey transition-colors duration-150 hover:bg-offwhite/5 hover:text-offwhite';

export const MiniMonth: React.FC<Props> = ({ anchorKey, todayKey, busyDateKeys, locale, onSelect }) => {
  const { t } = useTranslationWithPrefix('views.calendar');
  const [monthKey, setMonthKey] = useState(() => monthStartKey(anchorKey));
  useEffect(() => setMonthKey(monthStartKey(anchorKey)), [anchorKey]);
  const weeks = useMemo(() => monthGrid(monthKey), [monthKey]);
  const activeWeek = startOfWeekKey(anchorKey);

  return (
    <Panel className="shrink-0 p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[13px] font-semibold text-offwhite">{formatMonthTitle(monthKey, locale)}</span>
        <div className="flex gap-1">
          <button
            type="button"
            aria-label={t('sidebar.previousMonth')}
            className={navButton}
            onClick={() => setMonthKey(addMonthsToDateKey(monthKey, -1))}
          >
            <ChevronLeftIcon className="size-3.5" />
          </button>
          <button
            type="button"
            aria-label={t('sidebar.nextMonth')}
            className={navButton}
            onClick={() => setMonthKey(addMonthsToDateKey(monthKey, 1))}
          >
            <ChevronRightIcon className="size-3.5" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-[20px_repeat(7,minmax(0,1fr))] gap-y-0.5 text-center font-mono text-[11px]">
        <span />
        {weeks[0].map((dateKey) => (
          <span key={dateKey} className="pb-0.5 text-[10px] text-lightGrey">
            {formatWeekdayNarrow(dateKey, locale)}
          </span>
        ))}
        {weeks.map((week) => (
          <React.Fragment key={week[0]}>
            <span className="pt-1 text-[10px] text-darkishGrey">{isoWeekNumber(week[0])}</span>
            {week.map((dateKey, index) => {
              const inMonth = dateKey.slice(0, 7) === monthKey.slice(0, 7);
              const isToday = dateKey === todayKey;
              const inActiveWeek = week[0] === activeWeek;
              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => onSelect(dateKey)}
                  className={`relative cursor-pointer py-1 tabular-nums transition-colors duration-150 hover:text-offwhite ${
                    inActiveWeek ? 'bg-offwhite/5' : ''
                  } ${inActiveWeek && index === 0 ? 'rounded-l-md' : ''} ${inActiveWeek && index === 6 ? 'rounded-r-md' : ''} ${
                    inMonth ? 'text-[#b4b4d0]' : 'text-darkishGrey'
                  }`}
                >
                  {isToday && <span className="absolute inset-x-[3px] inset-y-px rounded-md bg-accent" />}
                  <span className={`relative ${isToday ? 'font-semibold text-white' : ''}`}>
                    {Number(dateKey.slice(8, 10))}
                  </span>
                  {busyDateKeys.has(dateKey) && !isToday && (
                    <span className="absolute bottom-0.5 left-1/2 size-[3px] -translate-x-1/2 rounded-full bg-lightGrey/70" />
                  )}
                </button>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </Panel>
  );
};
