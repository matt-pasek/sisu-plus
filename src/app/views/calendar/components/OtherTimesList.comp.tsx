import React from 'react';
import type { RoomInfo } from '@/app/api/dataPoints/calendar/types';
import { Button } from '@/app/components/ui/Button.comp';
import { PanelEyebrow } from '@/app/components/ui/PanelEyebrow.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import type { Session } from '@/app/schedule';
import { describeRoomShort, formatClock, formatSessionDate } from '../util';

interface Props {
  sessions: Session[];
  rooms: Record<string, RoomInfo>;
  locale: string;
  onGo: (other: Session) => void;
}

export const OtherTimesList: React.FC<Props> = ({ sessions, rooms, locale, onGo }) => {
  const { t } = useTranslationWithPrefix('views.calendar');
  const roomLabels = { noRoom: t('event.noRoom'), unavailable: t('event.roomUnavailable') };
  return (
    <div className="border-t border-border px-[18px] py-3">
      <PanelEyebrow>{t('event.otherTimes')}</PanelEyebrow>
      <ul className="mt-2 flex flex-col gap-1.5">
        {sessions.map((other) => (
          <li key={other.id} className="flex items-center gap-3 text-[12.5px]">
            <span className="min-w-0 flex-1">
              <span className="font-mono text-offwhite tabular-nums">
                {formatSessionDate(other.dateKey, locale)} · {formatClock(other.start)}–{formatClock(other.end)}
              </span>
              <span className="block truncate text-[11.5px] text-lightGrey">
                {[other.groupName, describeRoomShort(other.locationIds, rooms, roomLabels)].filter(Boolean).join(' · ')}
              </span>
            </span>
            <Button variant="onSurface" className="min-h-7 px-2" onClick={() => onGo(other)}>
              {t('actions.goToThis')}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};
