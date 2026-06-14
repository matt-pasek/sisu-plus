import { IcsCalendar, type IcsEvent } from 'ts-ics';
import React from 'react';
import { daysUntil } from '@/app/helpers/daysUntilToday';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { useChromeStorage } from '@/app/hooks/useChromeStorage';
import { getCurrentLocale } from '@/app/i18n';
import { hexA } from '@/app/views/dashboard/util/hexA';

interface Props {
  deadlines?: IcsCalendar;
}

interface DeadlineTone {
  color: string;
  badgeBg: string;
  cardBg: string;
  cardShadow: string;
  label: string;
}

const getDeadlineTone = (days: number): DeadlineTone => {
  if (days <= 2) {
    return {
      color: '#f06b6b',
      badgeBg: hexA('#f06b6b', 0.13),
      cardBg: hexA('#f06b6b', 0.08),
      cardShadow: `inset 0 0 0 1px ${hexA('#f06b6b', 0.16)}`,
      label: days < 0 ? 'overdue' : 'urgent',
    };
  }
  if (days <= 5) {
    return {
      color: '#f0a84d',
      badgeBg: hexA('#f0a84d', 0.13),
      cardBg: hexA('#f0a84d', 0.08),
      cardShadow: `inset 0 0 0 1px ${hexA('#f0a84d', 0.16)}`,
      label: 'soon',
    };
  }
  return {
    color: '#7878a0',
    badgeBg: 'var(--color-container2)',
    cardBg: 'var(--color-container2)',
    cardShadow: 'inset 0 0 0 1px rgba(255,255,255,0.045)',
    label: 'later',
  };
};

function getCourseCode(event: IcsEvent): string {
  return event.categories?.[0]?.split(' ')[0] ?? 'Moodle';
}

function getDateLabel(event: IcsEvent): string {
  const date = event.end?.date ?? event.start?.date;
  if (!date) return '';
  return new Date(date).toLocaleDateString(getCurrentLocale(), { month: 'short', day: 'numeric' });
}

function sortEvents(events: IcsEvent[]): IcsEvent[] {
  return [...events].sort((first, second) => daysUntil(first.end?.date) - daysUntil(second.end?.date));
}

const DeadlineRow: React.FC<{ event: IcsEvent; isLast: boolean }> = ({ event, isLast }) => {
  const { t } = useTranslationWithPrefix('views.dashboard');
  const days = daysUntil(event.end?.date);
  const tone = getDeadlineTone(days);
  const toneLabel = t(`widgets.moodleDeadlines.tone.${tone.label}`);
  const dayLabel = `${days < 0 ? days : days}d`;

  return (
    <div className="flex gap-3">
      <div className="flex shrink-0 flex-col items-center">
        <span
          className="mt-0.75 flex size-2.75 items-center justify-center rounded-full"
          style={{ background: hexA(tone.color, 0.2) }}
        >
          <span className="size-1.25 rounded-full" style={{ background: tone.color }} />
        </span>
        {!isLast && <span className="mt-0.75 w-0.5 flex-1" style={{ background: 'var(--color-border)' }} />}
      </div>

      <div
        className={`mb-2.5 min-w-0 flex-1 rounded-xl px-3 py-2.5 transition-[background-color] duration-200 ${isLast ? 'mb-0' : ''}`}
        style={{ background: tone.cardBg, boxShadow: tone.cardShadow }}
      >
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-[12.5px] font-semibold text-offwhite">{event.summary}</p>
          <span className="shrink-0 font-mono text-[11px] font-bold tabular-nums" style={{ color: tone.color }}>
            {dayLabel}
          </span>
        </div>
        <div className="mt-1.5 flex min-w-0 items-center gap-2">
          <span className="truncate font-mono text-[10.5px] text-lightGrey">{getCourseCode(event)}</span>
          {getDateLabel(event) && (
            <>
              <span className="size-0.75 shrink-0 rounded-full bg-border2" />
              <span className="shrink-0 text-[11px] text-lightGrey">{getDateLabel(event)}</span>
            </>
          )}
          <span
            className="ml-auto shrink-0 text-[9.5px] font-bold tracking-[0.08em] uppercase"
            style={{ color: tone.color }}
          >
            {toneLabel}
          </span>
        </div>
      </div>
    </div>
  );
};

export const MoodleDeadlinesContent: React.FC<Props> = ({ deadlines }) => {
  const { t } = useTranslationWithPrefix('views.dashboard');
  const events = sortEvents(deadlines?.events ?? []);
  const urgentCount = events.filter((event) => daysUntil(event.end?.date) <= 2).length;
  const [prefs] = useChromeStorage();
  const moodleBaseUrl = prefs.universityConfig?.moodleOrigin ?? '';

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-3 flex items-center justify-between rounded-xl bg-background/45 px-3 py-2.5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
        <div>
          <p className="text-[11px] text-lightGrey">{t('widgets.moodleDeadlines.nextPressure')}</p>
          <p
            className="mt-0.5 text-[13.5px] font-semibold"
            style={{ color: urgentCount > 0 ? '#f06b6b' : 'var(--color-offwhite)' }}
          >
            {urgentCount > 0
              ? t('widgets.moodleDeadlines.urgentItems', { count: urgentCount })
              : t('widgets.moodleDeadlines.noUrgentItems')}
          </p>
        </div>
        <span className="rounded-full bg-container2 px-2.5 py-1 font-mono text-xs font-bold text-lightGrey tabular-nums">
          {events.length}
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        <div className="pb-3">
          {events.map((event, i) => (
            <DeadlineRow key={event.uid} event={event} isLast={i === events.length - 1} />
          ))}
          {events.length === 0 && (
            <div className="flex h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-border text-center">
              <p className="text-sm font-medium text-offwhite">{t('widgets.moodleDeadlines.emptyTitle')}</p>
              <p className="mt-1 text-xs text-lightGrey">{t('widgets.moodleDeadlines.emptyBody')}</p>
            </div>
          )}
        </div>
      </div>

      <a
        href={moodleBaseUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex min-h-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-container2 text-sm font-medium text-lightGrey transition-[background-color,color,transform] duration-200 hover:bg-offwhite/10 hover:text-offwhite active:scale-[0.96]"
      >
        {t('widgets.moodleDeadlines.openMoodle')}
      </a>
    </div>
  );
};
