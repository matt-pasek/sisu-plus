import React from 'react';
import type { CalendarDeadline } from '@/app/api/dataPoints/calendar/types';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import type { AllDayItem } from '../types';
import { deadlineColor, formatClock, formatSessionDate } from '../util';

const CHIP = 'flex min-w-0 items-center gap-1.5 truncate rounded-md px-1.5 py-0.5 text-[11px] leading-[1.3]';

interface Props {
  item: AllDayItem;
  now: Date;
  locale: string;
  onSelectDeadline: (deadline: CalendarDeadline, element: HTMLElement) => void;
}

export const AllDayChip: React.FC<Props> = ({ item, now, locale, onSelectDeadline }) => {
  const { t } = useTranslationWithPrefix('views.calendar');
  if (item.kind === 'holiday') {
    return (
      <span className={`${CHIP} text-[#c8c8e0] shadow-[inset_0_0_0_1px_rgba(221,221,240,0.14)]`}>
        <span className="truncate">{t(`holidays.${item.holiday.id}`)}</span>
      </span>
    );
  }
  if (item.kind === 'periodStart') {
    return (
      <span className={`${CHIP} bg-lighterGreen/8 text-lighterGreen`}>
        <span className="truncate">{t('month.periodStarts', { period: item.name })}</span>
      </span>
    );
  }
  const { deadline } = item;
  const time = formatClock(deadline.dueAt);
  return (
    <button
      type="button"
      onClick={(event) => onSelectDeadline(deadline, event.currentTarget)}
      aria-label={t('deadlines.chipAria', {
        title: deadline.title,
        course: deadline.courseLabel ?? t('deadlines.noCourse'),
        date: formatSessionDate(deadline.dateKey, locale),
        time,
      })}
      className={`${CHIP} cursor-pointer bg-offwhite/5 text-left text-offwhite transition-colors duration-150 hover:bg-offwhite/10 focus-visible:outline-2 focus-visible:outline-lighterGreen ${deadline.dueAt <= now ? 'opacity-50' : ''}`}
    >
      <span
        aria-hidden="true"
        className="size-[7px] shrink-0 rounded-full"
        style={{ backgroundColor: deadlineColor(deadline) }}
      />
      <span className="truncate">{t('deadlines.chip', { time, title: deadline.title })}</span>
    </button>
  );
};
