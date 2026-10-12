import React from 'react';
import type { CalendarDeadline } from '@/app/api/dataPoints/calendar/types';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import type { AllDayItem } from '../types';
import { allDayLimit, formatSessionDate, splitAllDay } from '../util';
import { AllDayChip } from './AllDayChip.comp';

interface Props {
  dayKeys: string[];
  weekendCollapsed: boolean;
  itemsByDay: Record<string, AllDayItem[]>;
  now: Date;
  locale: string;
  onOpenDay: (dateKey: string) => void;
  onSelectDeadline: (deadline: CalendarDeadline, element: HTMLElement) => void;
}

export const AllDayRow: React.FC<Props> = ({
  dayKeys,
  weekendCollapsed,
  itemsByDay,
  now,
  locale,
  onOpenDay,
  onSelectDeadline,
}) => {
  const { t } = useTranslationWithPrefix('views.calendar');
  return (
    <>
      <div className="flex justify-end border-t border-border pt-1.5 pr-2 font-mono text-[9px] whitespace-nowrap text-darkishGrey uppercase">
        {t('deadlines.allDay')}
      </div>
      {dayKeys.map((dateKey) => {
        const { shown, hidden } = splitAllDay(itemsByDay[dateKey] ?? [], allDayLimit(dayKeys.length));
        return (
          <div key={dateKey} className="flex min-w-0 flex-col gap-0.5 border-t border-l border-border px-1 py-1">
            {shown.map((item, index) => (
              <AllDayChip
                key={`${item.kind}-${index}`}
                item={item}
                now={now}
                locale={locale}
                onSelectDeadline={onSelectDeadline}
              />
            ))}
            {hidden > 0 && (
              <button
                type="button"
                onClick={() => onOpenDay(dateKey)}
                aria-label={t('deadlines.moreAria', { count: hidden, date: formatSessionDate(dateKey, locale) })}
                className="w-fit cursor-pointer rounded-md px-1.5 font-mono text-[10.5px] text-lightGrey hover:text-offwhite"
              >
                {t('deadlines.more', { count: hidden })}
              </button>
            )}
          </div>
        );
      })}
      {weekendCollapsed && <div className="border-t border-l border-border" />}
    </>
  );
};
