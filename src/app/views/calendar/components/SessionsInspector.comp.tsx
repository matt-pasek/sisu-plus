import React from 'react';
import type { RoomInfo } from '@/app/api/dataPoints/calendar/types';
import { Panel } from '@/app/components/ui/Panel.comp';
import { PanelEyebrow } from '@/app/components/ui/PanelEyebrow.comp';
import { StatusChip } from '@/app/components/ui/StatusChip.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import type { Clash, Session } from '@/app/schedule';
import { getModuleColorValueByIndex } from '@/app/theme/moduleColors';
import { describeRoom, formatClock, formatSessionDate, groupByWeek, sessionChips } from '../util';
import { CloseIcon, WarningIcon } from './icons';
import { SessionChipBadge } from './SessionChipBadge.comp';

interface Props {
  series: Session[];
  clashesBySession: Map<string, Clash[]>;
  rooms: Record<string, RoomInfo>;
  now: Date;
  locale: string;
  onClose: () => void;
}

export const SessionsInspector: React.FC<Props> = ({ series, clashesBySession, rooms, now, locale, onClose }) => {
  const { t } = useTranslationWithPrefix('views.calendar');
  const first = series[0];
  if (!first) return null;

  const roomLabels = { noRoom: t('event.noRoom'), unavailable: t('event.roomUnavailable') };
  const nextId = series.find((session) => session.end > now && !session.cancelled)?.id ?? null;
  const clashCount = series.filter((session) => (clashesBySession.get(session.id) ?? []).length > 0).length;
  const roomCount = new Set(series.map((session) => session.locationIds.join())).size;

  return (
    <Panel
      className="max-lg:fixed max-lg:inset-x-4 max-lg:bottom-4 max-lg:z-40 max-lg:max-h-[60dvh]"
      header={
        <>
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              aria-hidden="true"
              className="w-1 self-stretch rounded-full"
              style={{ backgroundColor: getModuleColorValueByIndex(first.colorIndex) }}
            />
            <div className="min-w-0">
              <PanelEyebrow>{`${t('sessions.title')} · ${t(`kinds.${first.kind}`)}`}</PanelEyebrow>
              <p className="truncate text-sm font-semibold text-offwhite">{first.courseName}</p>
            </div>
          </div>
          <button
            type="button"
            aria-label={t('actions.close')}
            onClick={onClose}
            className="cursor-pointer rounded-md p-1 text-lightGrey transition-colors duration-150 hover:text-offwhite"
          >
            <CloseIcon className="size-4" />
          </button>
        </>
      }
    >
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3.5">
        <div className="mb-3 flex flex-wrap gap-1.5">
          <StatusChip tone="neutral">{t('sessions.total', { count: series.length })}</StatusChip>
          {clashCount > 0 && (
            <StatusChip tone="warn" icon={<WarningIcon className="size-2.5" />}>
              {t('sessions.clashes', { count: clashCount })}
            </StatusChip>
          )}
          <StatusChip tone="info">{t('sessions.rooms', { count: roomCount })}</StatusChip>
        </div>
        {groupByWeek(series).map(({ week, sessions }) => (
          <section key={week}>
            <h4 className="mt-3 mb-1 font-mono text-[10px] font-semibold tracking-[0.12em] text-lightGrey uppercase">
              {t('sessions.week', { week })}
            </h4>
            {sessions.map((session) => {
              const previous = series[series.indexOf(session) - 1];
              const chips = sessionChips(session, previous, clashesBySession.get(session.id));
              return (
                <div
                  key={session.id}
                  className={`-mx-2 grid grid-cols-[76px_84px_minmax(0,1fr)_auto] items-center gap-2 rounded-lg px-2 py-1.5 text-[12.5px] ${
                    session.id === nextId ? 'bg-offwhite/5' : ''
                  } ${session.end <= now ? 'opacity-45' : ''}`}
                >
                  <span className={`font-mono text-[11px] text-offwhite ${session.cancelled ? 'line-through' : ''}`}>
                    {formatSessionDate(session.dateKey, locale)}
                  </span>
                  <span className="font-mono text-[11px] text-lightGrey tabular-nums">
                    {formatClock(session.start)}–{formatClock(session.end)}
                  </span>
                  <span className="truncate text-[#c0c0da]">
                    {describeRoom(session.locationIds, rooms, roomLabels)}
                  </span>
                  <span className="flex gap-1">
                    {chips.map((chip) => (
                      <SessionChipBadge key={chip.type} chip={chip} />
                    ))}
                  </span>
                </div>
              );
            })}
          </section>
        ))}
      </div>
    </Panel>
  );
};
