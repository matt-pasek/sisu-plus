import React from 'react';
import type { RoomInfo } from '@/app/api/dataPoints/calendar/types';
import { Panel } from '@/app/components/ui/Panel.comp';
import { PanelEyebrow } from '@/app/components/ui/PanelEyebrow.comp';
import { StatusChip } from '@/app/components/ui/StatusChip.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import type { Clash, Session } from '@/app/schedule';
import { getModuleColorValueByIndex } from '@/app/theme/moduleColors';
import type { SessionBadge } from '../types';
import { groupByWeek } from '../util';
import { CloseIcon, WarningIcon } from './icons';
import { SessionRow } from './SessionRow.comp';

interface Props {
  series: Session[];
  clashesBySession: Map<string, Clash[]>;
  badges: Map<string, SessionBadge>;
  rooms: Record<string, RoomInfo>;
  now: Date;
  locale: string;
  onClose: () => void;
}

export const SessionsInspector: React.FC<Props> = ({
  series,
  clashesBySession,
  badges,
  rooms,
  now,
  locale,
  onClose,
}) => {
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
            className="relative cursor-pointer rounded-md p-1 text-lightGrey transition-colors duration-150 after:absolute after:-inset-2 after:content-[''] hover:text-offwhite"
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
          <section key={week} className="border-t border-border py-0.5 first-of-type:border-t-0">
            {sessions.map((session, index) => (
              <SessionRow
                key={session.id}
                session={session}
                previous={series[series.indexOf(session) - 1]}
                clashes={clashesBySession.get(session.id)}
                badge={badges.get(session.id) ?? null}
                rooms={rooms}
                roomLabels={roomLabels}
                weekLabel={index === 0 ? t('weekShort', { week }) : null}
                isNext={session.id === nextId}
                isPast={session.end <= now}
                locale={locale}
              />
            ))}
          </section>
        ))}
      </div>
    </Panel>
  );
};
