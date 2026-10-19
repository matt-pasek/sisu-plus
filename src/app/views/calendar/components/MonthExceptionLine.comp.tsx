import React from 'react';
import type { RoomInfo } from '@/app/api/dataPoints/calendar/types';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import type { Session } from '@/app/schedule';
import type { MonthException } from '../types';
import { deadlineColor, describeRoomShort, formatClock } from '../util';
import { ArrowRightIcon, CalendarIcon, CrossIcon, DiamondIcon, NoteIcon, PinIcon, WarningIcon } from './icons';

const ICON = 'size-[11px] shrink-0';

interface Props {
  exception: MonthException;
  sessionsById: Map<string, Session>;
  rooms: Record<string, RoomInfo>;
}

export const MonthExceptionLine: React.FC<Props> = ({ exception, sessionsById, rooms }) => {
  const { t } = useTranslationWithPrefix('views.calendar');
  const roomLabels = { noRoom: t('event.noRoom'), unavailable: t('event.roomUnavailable') };
  const nameOf = (id: string): string => sessionsById.get(id)?.courseName ?? '';
  const line = ((): { className: string; icon: React.ReactNode; text: string; struck: boolean } => {
    switch (exception.kind) {
      case 'exam':
        return {
          className: 'bg-offwhite/8 font-semibold text-offwhite',
          icon: <DiamondIcon className={ICON} />,
          text: t('month.exam', { course: exception.session.courseName, time: formatClock(exception.session.start) }),
          struck: false,
        };
      case 'cancelled':
        return {
          className: 'bg-offwhite/3 text-lightGrey',
          icon: <CrossIcon className={ICON} />,
          text: t('month.cancelled', {
            course: exception.session.courseName,
            kind: t(`kinds.${exception.session.kind}`).toLowerCase(),
          }),
          struck: true,
        };
      case 'roomChange':
        return {
          className: 'bg-blue-400/8 text-blue-300',
          icon: <PinIcon className={ICON} />,
          text: t('month.roomChange', {
            course: exception.session.courseName,
            room: describeRoomShort(exception.session.locationIds, rooms, roomLabels),
          }),
          struck: false,
        };
      case 'clash':
        return {
          className: 'bg-warn/8 text-warn shadow-[inset_0_0_0_1px_rgba(240,168,77,0.22)]',
          icon: <WarningIcon className={ICON} />,
          text: t('month.clash', {
            first: nameOf(exception.clash.sessionIds[0]),
            second: nameOf(exception.clash.sessionIds[1]),
            time: formatClock(exception.clash.start),
          }),
          struck: false,
        };
      case 'periodStart':
        return {
          className: 'bg-lighterGreen/8 text-lighterGreen',
          icon: <ArrowRightIcon className={ICON} />,
          text: t('month.periodStarts', { period: exception.name }),
          struck: false,
        };
      case 'holiday':
        return {
          className: 'text-[#c8c8e0] shadow-[inset_0_0_0_1px_rgba(221,221,240,0.14)]',
          icon: <CalendarIcon className={ICON} />,
          text: t(`holidays.${exception.holiday.id}`),
          struck: false,
        };
      case 'noTeaching':
        return { className: 'bg-offwhite/5 text-lightGrey', icon: null, text: t('month.noTeaching'), struck: false };
      case 'note':
        return {
          className: 'bg-lighterGreen/[0.07] text-[#9be3bb]',
          icon: <NoteIcon className={ICON} />,
          text: t('notes.monthLine', { time: formatClock(exception.note.start), name: exception.note.name }),
          struck: false,
        };
      case 'deadline':
        return {
          className: 'bg-offwhite/5 text-offwhite',
          icon: (
            <span
              aria-hidden="true"
              className="size-[7px] shrink-0 rounded-full"
              style={{ backgroundColor: deadlineColor(exception.deadline) }}
            />
          ),
          text: t('deadlines.monthLine', {
            time: formatClock(exception.deadline.dueAt),
            title: exception.deadline.title,
          }),
          struck: false,
        };
      case 'moreDeadlines':
        return {
          className: 'text-lightGrey',
          icon: null,
          text: t('month.moreDeadlines', { count: exception.count }),
          struck: false,
        };
    }
  })();
  return (
    <span
      className={`flex min-w-0 items-center gap-1.5 overflow-hidden rounded-md px-1.5 py-0.5 text-[11px] leading-[1.3] whitespace-nowrap ${line.className}`}
    >
      {line.icon}
      <span className={`truncate ${line.struck ? 'line-through' : ''}`}>{line.text}</span>
    </span>
  );
};
