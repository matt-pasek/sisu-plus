import React from 'react';
import type { CalendarDeadline } from '@/app/api/dataPoints/calendar/types';
import { PanelEyebrow } from '@/app/components/ui/PanelEyebrow.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { deadlineColor, dueRelative, formatClock, formatSessionDate } from '../util';

interface Props {
  deadlines: CalendarDeadline[];
  todayKey: string;
  locale: string;
}

export const DueSoonList: React.FC<Props> = ({ deadlines, todayKey, locale }) => {
  const { t } = useTranslationWithPrefix('views.calendar');
  if (deadlines.length === 0) return null;
  const relativeText = (deadline: CalendarDeadline): string => {
    const relative = dueRelative(deadline.dateKey, todayKey);
    if (relative.kind === 'today') return t('deadlines.dueToday');
    if (relative.kind === 'tomorrow') return t('deadlines.dueTomorrow');
    return t('deadlines.dueInDays', { count: relative.count });
  };
  return (
    <section>
      <PanelEyebrow>{t('deadlines.dueSoon')}</PanelEyebrow>
      <div className="mt-1">
        {deadlines.map((deadline) => (
          <div
            key={deadline.id}
            className="grid grid-cols-[8px_minmax(0,1fr)] items-baseline gap-2.5 border-t border-border py-[7px] text-[13px] first:border-t-0"
          >
            <span
              aria-hidden="true"
              className="size-2 rounded-full"
              style={{ backgroundColor: deadlineColor(deadline) }}
            />
            <span className="min-w-0 text-offwhite">
              <span className="block truncate">{deadline.title}</span>
              <span className="block truncate text-[11.5px] text-lightGrey">
                {t('deadlines.dueRow', {
                  date: formatSessionDate(deadline.dateKey, locale),
                  time: formatClock(deadline.dueAt),
                  relative: relativeText(deadline),
                })}
              </span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};
