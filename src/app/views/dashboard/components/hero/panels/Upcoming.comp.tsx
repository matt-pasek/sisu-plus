import React, { useMemo } from 'react';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { IcsCalendar } from 'ts-ics';
import { daysUntil } from '@/app/helpers/daysUntilToday';
import { formatShortDate } from '@/app/views/dashboard/util/formatShortDate';

const getUrgencyStyle = (days: number) => {
  if (days <= 1) return { border: 'border-red-400', bg: 'bg-red-400/6', badge: 'bg-red-400/15 text-red-300' };
  if (days <= 3) return { border: 'border-amber-400', bg: 'bg-amber-400/5', badge: 'bg-amber-400/15 text-amber-300' };
  return { border: 'border-white/12', bg: '', badge: 'bg-white/8 text-lightGrey' };
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
      .slice(0, 4);
  }, [deadlines]);

  return (
    <div className="hidden min-w-52 flex-col gap-2 md:flex">
      <p className="font-mono text-[9px] font-semibold tracking-[0.12em] text-lightGrey uppercase">
        {t('hero.panel.upcoming')}
      </p>
      {events.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-5 text-center">
          <svg
            aria-hidden="true"
            className="size-7 text-lightGrey/25"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path
              d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="text-[11px] text-lightGrey/50">{t('hero.panelUpcomingEmpty')}</p>
        </div>
      ) : (
        events.map((ev, i) => {
          const days = daysUntil(ev.end?.date);
          const { border, bg, badge } = getUrgencyStyle(days);
          return (
            <div
              key={i}
              className={`flex items-start gap-2.5 overflow-hidden rounded-lg border-l-2 ${border} ${bg} bg-background/40 px-2.5 py-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]`}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-medium text-offwhite">{ev.summary}</p>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <p className="text-[10px] text-lightGrey/55">{ev.end?.date ? formatShortDate(ev.end.date) : ''}</p>
                  {days <= 7 && (
                    <span className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${badge}`}>{days}d</span>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
