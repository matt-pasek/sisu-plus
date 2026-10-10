import React, { useMemo } from 'react';
import type { RoomInfo } from '@/app/api/dataPoints/calendar/types';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { helsinkiMinutesOfDay, layoutDay, type Clash, type HourRange, type Session } from '@/app/schedule';
import { describeRoom, formatClock, formatSessionDate, joinNames, minutesToOffset, sessionBox } from '../util';
import { NowLine } from './NowLine.comp';
import { OverflowChip } from './OverflowChip.comp';
import { SessionBlock } from './SessionBlock.comp';

interface Props {
  dateKey: string;
  isToday: boolean;
  now: Date;
  sessions: Session[];
  sessionsById: Map<string, Session>;
  hourRange: HourRange;
  hourHeight: number;
  clashesBySession: Map<string, Clash[]>;
  rooms: Record<string, RoomInfo>;
  activeSessionId: string | null;
  locale: string;
  onSelect: (session: Session, element: HTMLElement) => void;
}

export const WeekDayColumn: React.FC<Props> = ({
  dateKey,
  isToday,
  now,
  sessions,
  sessionsById,
  hourRange,
  hourHeight,
  clashesBySession,
  rooms,
  activeSessionId,
  locale,
  onSelect,
}) => {
  const { t } = useTranslationWithPrefix('views.calendar');
  const layout = useMemo(() => layoutDay(sessions), [sessions]);
  const roomLabels = { noRoom: t('event.noRoom'), unavailable: t('event.roomUnavailable') };
  const nowMinutes = helsinkiMinutesOfDay(now);
  const showNow = isToday && nowMinutes >= hourRange.startHour * 60 && nowMinutes <= hourRange.endHour * 60;

  const ariaLabelFor = (session: Session, room: string, clashes: Clash[]): string => {
    const base = t('aria.session', {
      kind: t(`kinds.${session.kind}`),
      course: session.courseName,
      date: formatSessionDate(dateKey, locale),
      start: formatClock(session.start),
      end: formatClock(session.end),
      room,
    });
    if (clashes.length === 0) return base;
    const names = clashes
      .flatMap((clash) => clash.sessionIds.filter((id) => id !== session.id))
      .map((id) => sessionsById.get(id)?.courseName)
      .filter((name): name is string => Boolean(name));
    return `${base}, ${t('aria.clash', { names: joinNames([...new Set(names)], locale) })}`;
  };

  return (
    <div
      className={`relative border-l border-border ${isToday ? 'bg-accent/[0.025]' : ''}`}
      style={{
        backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent ${hourHeight - 1}px, rgba(34,34,40,0.8) ${hourHeight - 1}px, rgba(34,34,40,0.8) ${hourHeight}px)`,
      }}
    >
      {sessions.map((session) => {
        const placement = layout.placements[session.id];
        if (!placement) return null;
        const clashes = clashesBySession.get(session.id) ?? [];
        const room = describeRoom(session.locationIds, rooms, roomLabels);
        return (
          <SessionBlock
            key={session.id}
            session={session}
            placement={placement}
            box={sessionBox(session, hourRange, hourHeight)}
            isClashing={clashes.length > 0}
            isActive={activeSessionId === session.id}
            isDimmed={activeSessionId != null && activeSessionId !== session.id}
            kindLabel={t(`kinds.${session.kind}`)}
            roomName={room}
            ariaLabel={ariaLabelFor(session, room, clashes)}
            onSelect={onSelect}
          />
        );
      })}
      {layout.overflow.map((slot) => (
        <OverflowChip
          key={slot.sessionIds.join()}
          top={minutesToOffset(helsinkiMinutesOfDay(slot.start), hourRange, hourHeight)}
          count={slot.sessionIds.length}
        />
      ))}
      {showNow && <NowLine top={minutesToOffset(nowMinutes, hourRange, hourHeight)} />}
    </div>
  );
};
