import React from 'react';
import type { RoomInfo } from '@/app/api/dataPoints/calendar/types';
import { StatusChip } from '@/app/components/ui/StatusChip.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import type { Clash, Session } from '@/app/schedule';
import type { RoomLabels, SessionBadge } from '../types';
import { describeRoom, describeRoomShort, formatClock, formatSessionDate, sessionChips } from '../util';
import { SessionChipBadge } from './SessionChipBadge.comp';

interface Props {
  session: Session;
  previous: Session | undefined;
  clashes: Clash[] | undefined;
  badge: SessionBadge | null;
  rooms: Record<string, RoomInfo>;
  roomLabels: RoomLabels;
  weekLabel: string | null;
  isNext: boolean;
  isPast: boolean;
  locale: string;
}

export const SessionRow: React.FC<Props> = ({
  session,
  previous,
  clashes,
  badge,
  rooms,
  roomLabels,
  weekLabel,
  isNext,
  isPast,
  locale,
}) => {
  const { t } = useTranslationWithPrefix('views.calendar');
  const chips = sessionChips(session, previous, clashes, badge);
  return (
    <div
      className={`-mx-2 grid grid-cols-[38px_68px_76px_minmax(0,1fr)] items-baseline gap-x-2 rounded-lg px-2 py-1.5 text-[12px] ${
        isNext ? 'bg-offwhite/5' : ''
      } ${isPast ? 'opacity-45' : ''}`}
    >
      <span className="font-mono text-[10px] text-darkishGrey uppercase">{weekLabel}</span>
      <span className={`font-mono text-[11px] text-offwhite ${session.cancelled ? 'line-through' : ''}`}>
        {formatSessionDate(session.dateKey, locale)}
      </span>
      <span className="font-mono text-[11px] text-lightGrey tabular-nums">
        {formatClock(session.start)}–{formatClock(session.end)}
      </span>
      <span className="min-w-0 truncate text-[#c0c0da]" title={describeRoom(session.locationIds, rooms, roomLabels)}>
        {describeRoomShort(session.locationIds, rooms, roomLabels)}
      </span>
      {(isNext || chips.length > 0) && (
        <span className="col-start-2 col-end-5 mt-1 flex flex-wrap gap-1">
          {isNext && <StatusChip tone="ok">{t('sessions.next')}</StatusChip>}
          {chips.map((chip) => (
            <SessionChipBadge key={chip.type} chip={chip} />
          ))}
        </span>
      )}
    </div>
  );
};
