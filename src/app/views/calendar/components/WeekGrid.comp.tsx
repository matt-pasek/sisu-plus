import React, { useMemo } from 'react';
import type { RoomInfo } from '@/app/api/dataPoints/calendar/types';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { visibleHourRange, type Clash, type HourRange, type Session } from '@/app/schedule';
import { sessionsOnDay } from '../util';
import { HourGutter } from './HourGutter.comp';
import { WeekDayColumn } from './WeekDayColumn.comp';
import { WeekDayHeader } from './WeekDayHeader.comp';

const HOUR_HEIGHT = 48;
const DEFAULT_HOURS: HourRange = { startHour: 8, endHour: 18 };
const WEEKDAYS = 5;

interface Props {
  weekKeys: string[];
  todayKey: string;
  now: Date;
  sessions: Session[];
  sessionsById: Map<string, Session>;
  clashesBySession: Map<string, Clash[]>;
  rooms: Record<string, RoomInfo>;
  activeSessionId: string | null;
  locale: string;
  onSelect: (session: Session, element: HTMLElement) => void;
  onScroll: () => void;
}

export const WeekGrid: React.FC<Props> = ({
  weekKeys,
  todayKey,
  now,
  sessions,
  sessionsById,
  clashesBySession,
  rooms,
  activeSessionId,
  locale,
  onSelect,
  onScroll,
}) => {
  const { t } = useTranslationWithPrefix('views.calendar');
  const hourRange = useMemo(() => visibleHourRange(sessions, DEFAULT_HOURS), [sessions]);
  const days = useMemo(
    () => weekKeys.map((dateKey) => ({ dateKey, sessions: sessionsOnDay(sessions, dateKey) })),
    [weekKeys, sessions],
  );
  const weekendEmpty = days.slice(WEEKDAYS).every((day) => day.sessions.length === 0);
  const columns = weekendEmpty ? days.slice(0, WEEKDAYS) : days;
  const template = `52px repeat(${columns.length}, minmax(0, 1fr))${weekendEmpty ? ' 34px' : ''}`;
  const hours = Array.from({ length: hourRange.endHour - hourRange.startHour }, (_, i) => hourRange.startHour + i);

  return (
    <div className="relative min-h-0 flex-1 overflow-y-auto" onScroll={onScroll}>
      <div
        className="sticky top-0 z-20 grid border-b border-border2 bg-container"
        style={{ gridTemplateColumns: template }}
      >
        <div />
        {columns.map(({ dateKey }) => (
          <WeekDayHeader key={dateKey} dateKey={dateKey} isToday={dateKey === todayKey} locale={locale} />
        ))}
        {weekendEmpty && (
          <div className="flex items-center justify-center border-l border-border font-mono text-[10px] text-darkishGrey">
            {t('weekendShort')}
          </div>
        )}
      </div>
      <div className="relative grid" style={{ gridTemplateColumns: template, height: hours.length * HOUR_HEIGHT }}>
        <HourGutter hours={hours} hourHeight={HOUR_HEIGHT} />
        {columns.map(({ dateKey, sessions: daySessions }) => (
          <WeekDayColumn
            key={dateKey}
            dateKey={dateKey}
            isToday={dateKey === todayKey}
            now={now}
            sessions={daySessions}
            sessionsById={sessionsById}
            hourRange={hourRange}
            hourHeight={HOUR_HEIGHT}
            clashesBySession={clashesBySession}
            rooms={rooms}
            activeSessionId={activeSessionId}
            locale={locale}
            onSelect={onSelect}
          />
        ))}
        {weekendEmpty && (
          <div className="border-l border-border bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.012)_0_6px,transparent_6px_12px)]" />
        )}
      </div>
      {sessions.length === 0 && (
        <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-lightGrey">
          {t('states.emptyWeek')}
        </p>
      )}
    </div>
  );
};
