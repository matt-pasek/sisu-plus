import React from 'react';
import type { CalendarDeadline } from '@/app/api/dataPoints/calendar/types';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import type { AllDayItem } from '../types';
import { allDayLimit, formatSessionDate, splitAllDay } from '../util';
import { AllDayChip } from './AllDayChip.comp';

interface Props {
  dayKeys: string[];
  weekendCollapsed: boolean;
  weekendDue: { count: number; firstDateKey: string | null } | null;
  itemsByDay: Record<string, AllDayItem[]>;
  now: Date;
  locale: string;
  onOpenDay: (dateKey: string) => void;
  onSelectDeadline: (deadline: CalendarDeadline, element: HTMLElement) => void;
}

export const AllDayRow: React.FC<Props> = ({
  dayKeys,
  weekendCollapsed,
  weekendDue,
  itemsByDay,
  now,
  locale,
  onOpenDay,
  onSelectDeadline,
}) => {
  const { t } = useTranslationWithPrefix('views.calendar');
  const weekendFirst = weekendDue?.firstDateKey ?? null;
  const weekendLabel = weekendFirst
    ? t('weekendDueAria', { count: weekendDue?.count ?? 0, date: formatSessionDate(weekendFirst, locale) })
    : undefined;
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
      {weekendCollapsed && (
        <div className="flex justify-center border-t border-l border-border py-1">
          {weekendDue && weekendDue.count > 0 && weekendFirst && (
            <button
              type="button"
              onClick={() => onOpenDay(weekendFirst)}
              aria-label={weekendLabel}
              title={weekendLabel}
              className="flex h-fit cursor-pointer items-center gap-1 rounded-md px-1 py-0.5 font-mono text-[10.5px] text-offwhite transition-colors duration-150 hover:bg-offwhite/10 focus-visible:outline-2 focus-visible:outline-lighterGreen"
            >
              <span aria-hidden="true" className="size-1.5 rounded-full bg-offwhite/60" />
              {weekendDue.count}
            </button>
          )}
        </div>
      )}
    </>
  );
};
