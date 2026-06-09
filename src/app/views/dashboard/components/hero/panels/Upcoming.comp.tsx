import React, { useMemo } from 'react';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { IcsCalendar } from 'ts-ics';
import { daysUntil } from '@/app/helpers/daysUntilToday';
import { formatShortDate } from '@/app/views/dashboard/util/formatShortDate';

const getUrgencyDot = (days: number): string => {
  if (days <= 1) return 'bg-red-400';
  if (days <= 3) return 'bg-amber-400';
  return 'bg-lightGrey/40';
};

interface Props {
  deadlines?: IcsCalendar;
}

export const Upcoming: React.FC<Props> = ({ deadlines }) => {
  const { t } = useTranslationWithPrefix('views.dashboard');

  const events = useMemo(() => {
    if (!deadlines?.events) return [];
    const now = Date.now();
    return Object.values(deadlines.events)
      .filter((ev) => ev.end?.date && ev.end.date.getTime() > now)
      .sort((a, b) => a.end!.date!.getTime() - b.end!.date!.getTime())
      .slice(0, 3);
  }, [deadlines]);

  return (
    <div className="hidden min-w-44 flex-col gap-2 md:flex">
      <p className="font-mono text-[9px] font-semibold tracking-[0.12em] text-lightGrey uppercase">
        {t('hero.panel.upcoming')}
      </p>
      {events.length === 0 ? (
        <p className="text-[12px] text-lightGrey/60">{t('hero.panelUpcomingEmpty')}</p>
      ) : (
        events.map((ev, i) => {
          const days = daysUntil(ev.end?.date);
          return (
            <div
              key={i}
              className="flex items-start gap-2 rounded-lg bg-background/40 px-2.5 py-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]"
            >
              <span className={`mt-1.5 size-1.5 shrink-0 rounded-full ${getUrgencyDot(days)}`} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-medium text-offwhite">{ev.summary}</p>
                <p className="mt-0.5 text-[10px] text-lightGrey/60">
                  {ev.end?.date ? formatShortDate(ev.end.date) : ''}
                  {days <= 5 && (
                    <span className="ml-1.5 rounded-sm bg-amber-400/15 px-1 py-0.5 text-[9px] font-semibold text-amber-300">
                      {days}d
                    </span>
                  )}
                </p>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
