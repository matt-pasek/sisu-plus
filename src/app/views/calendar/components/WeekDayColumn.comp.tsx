import React, { useMemo } from 'react';
import type { CourseUnitInfo, RoomInfo } from '@/app/api/dataPoints/calendar/types';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { helsinkiMinutesOfDay, layoutDay, type Clash, type HourRange, type Session } from '@/app/schedule';
import {
  describeRoom,
  describeRoomShort,
  formatClock,
  formatSessionDate,
  joinNames,
  minutesToOffset,
  sessionBox,
} from '../util';
import { NowLine } from './NowLine.comp';
import { OVERFLOW_STRIP_WIDTH, OverflowChip } from './OverflowChip.comp';
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
  courseUnits: Record<string, CourseUnitInfo>;
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
  courseUnits,
  activeSessionId,
  locale,
  onSelect,
}) => {
  const { t } = useTranslationWithPrefix('views.calendar');
  const layout = useMemo(() => layoutDay(sessions), [sessions]);
  const roomLabels = { noRoom: t('event.noRoom'), unavailable: t('event.roomUnavailable') };
  const nowMinutes = helsinkiMinutesOfDay(now);
  const showNow = isToday && nowMinutes >= hourRange.startHour * 60 && nowMinutes <= hourRange.endHour * 60;
  const inOverflowCluster = (session: Session): boolean =>
    layout.overflow.some((slot) => session.start < slot.end && session.end > slot.start);

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
            reservedRight={inOverflowCluster(session) ? OVERFLOW_STRIP_WIDTH : 0}
            code={session.courseUnitId ? (courseUnits[session.courseUnitId]?.code ?? null) : null}
            isClashing={clashes.length > 0}
            isActive={activeSessionId === session.id}
            isDimmed={activeSessionId != null && activeSessionId !== session.id}
            isPast={session.end <= now}
            kindLabel={t(`kinds.${session.kind}`)}
            roomName={describeRoomShort(session.locationIds, rooms, roomLabels)}
            ariaLabel={ariaLabelFor(session, room, clashes)}
            onSelect={onSelect}
          />
        );
      })}
      {layout.overflow.map((slot) => {
        const hidden = slot.sessionIds
          .map((id) => sessionsById.get(id))
          .filter((session): session is Session => session != null);
        return (
          <OverflowChip
            key={slot.sessionIds.join()}
            top={minutesToOffset(helsinkiMinutesOfDay(slot.start), hourRange, hourHeight)}
            count={slot.sessionIds.length}
            ariaLabel={t('aria.moreSessions', {
              count: hidden.length,
              names: joinNames(
                hidden.map((session) => `${session.courseName} ${formatClock(session.start)}`),
                locale,
              ),
            })}
            onOpen={(element) => {
              if (hidden[0]) onSelect(hidden[0], element);
            }}
          />
        );
      })}
      {showNow && <NowLine top={minutesToOffset(nowMinutes, hourRange, hourHeight)} />}
    </div>
  );
};
