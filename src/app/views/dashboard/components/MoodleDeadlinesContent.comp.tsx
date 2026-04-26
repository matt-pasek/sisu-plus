import { IcsCalendar, type IcsEvent } from 'ts-ics';
import React from 'react';
import { daysUntil } from '@/app/helpers/daysUntilToday';

interface Props {
  deadlines?: IcsCalendar;
}

interface DeadlineTone {
  accent: string;
  badge: string;
  card: string;
  label: string;
}

const getDeadlineTone = (days: number): DeadlineTone => {
  if (days < 0) {
    return {
      accent: '#F06B6B',
      badge: 'bg-danger/15 text-danger ring-danger/20',
      card: 'bg-danger/10 shadow-[inset_0_0_0_1px_rgba(240,107,107,0.18),0_8px_18px_rgba(0,0,0,0.16)]',
      label: 'Overdue',
    };
  }

  if (days <= 2) {
    return {
      accent: '#F06B6B',
      badge: 'bg-danger/15 text-danger ring-danger/20',
      card: 'bg-danger/10 shadow-[inset_0_0_0_1px_rgba(240,107,107,0.16),0_8px_18px_rgba(0,0,0,0.16)]',
      label: 'Urgent',
    };
  }

  if (days <= 5) {
    return {
      accent: '#F0A84D',
      badge: 'bg-warn/15 text-warn ring-warn/20',
      card: 'bg-warn/10 shadow-[inset_0_0_0_1px_rgba(240,168,77,0.16),0_8px_18px_rgba(0,0,0,0.16)]',
      label: 'Soon',
    };
  }

  return {
    accent: '#7878A0',
    badge: 'bg-container2 text-lightGrey ring-white/5',
    card: 'bg-container2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.045),0_8px_18px_rgba(0,0,0,0.12)]',
    label: 'Later',
  };
};

function getCourseCode(event: IcsEvent): string {
  return event.categories?.[0]?.split(' ')[0] ?? 'Moodle';
}

function getDateLabel(event: IcsEvent): string {
  const date = event.end?.date ?? event.start?.date;
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function sortEvents(events: IcsEvent[]): IcsEvent[] {
  return [...events].sort((first, second) => daysUntil(first.end?.date) - daysUntil(second.end?.date));
}

const DeadlineCard: React.FC<{ event: IcsEvent }> = ({ event }) => {
  const days = daysUntil(event.end?.date);
  const tone = getDeadlineTone(days);
  const dayLabel = days < 0 ? `${days}d` : `${days}d`;

  return (
    <article
      className={`group relative overflow-hidden rounded-xl px-3 py-2.5 transition-[background-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 ${tone.card}`}
      title={`${event.summary} · ${tone.label} · ${dayLabel}`}
    >
      <div className="absolute inset-y-2 left-0 w-1 rounded-r-full" style={{ backgroundColor: tone.accent }} />
      <div className="flex items-start justify-between gap-3 pl-2">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-offwhite">{event.summary}</h3>
          <div className="mt-1.5 flex min-w-0 items-center gap-2">
            <span className="truncate font-mono text-xs text-lightGrey">{getCourseCode(event)}</span>
            {getDateLabel(event) && (
              <>
                <span className="size-1 rounded-full bg-border2" />
                <span className="shrink-0 text-xs text-lightGrey">{getDateLabel(event)}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span
            className={`rounded-full px-2 py-0.5 font-mono text-xs font-semibold tabular-nums ring-1 ${tone.badge}`}
          >
            {dayLabel}
          </span>
          <span className="text-[10px] font-semibold tracking-wide text-lightGrey uppercase">{tone.label}</span>
        </div>
      </div>
    </article>
  );
};

export const MoodleDeadlinesContent: React.FC<Props> = ({ deadlines }) => {
  const events = sortEvents(deadlines?.events ?? []);
  const urgentCount = events.filter((event) => daysUntil(event.end?.date) <= 2).length;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-3 flex items-center justify-between rounded-xl bg-background/45 px-3 py-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
        <div>
          <p className="text-xs font-medium text-lightGrey">Next deadline pressure</p>
          <p className="text-sm font-semibold text-offwhite">
            {urgentCount > 0 ? `${urgentCount} urgent item${urgentCount === 1 ? '' : 's'}` : 'No urgent items'}
          </p>
        </div>
        <span className="rounded-full bg-container2 px-2.5 py-1 font-mono text-xs font-semibold text-lightGrey tabular-nums">
          {events.length}
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        <div className="flex flex-col gap-2.5 pb-3">
          {events.map((event) => (
            <DeadlineCard key={event.uid} event={event} />
          ))}
          {events.length === 0 && (
            <div className="flex h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-border text-center">
              <p className="text-sm font-medium text-offwhite">No deadlines approaching</p>
              <p className="mt-1 text-xs text-lightGrey">Moodle sync is connected, but there is nothing urgent.</p>
            </div>
          )}
        </div>
      </div>

      <a
        href="https://moodle.lut.fi"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex min-h-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-container2 text-sm font-medium text-lightGrey transition-[background-color,color,transform] duration-200 hover:bg-offwhite/10 hover:text-offwhite active:scale-[0.96]"
      >
        Open Moodle
      </a>
    </div>
  );
};
