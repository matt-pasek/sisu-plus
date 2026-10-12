import React, { useMemo } from 'react';
import type { CalendarDeadline, RoomInfo } from '@/app/api/dataPoints/calendar/types';
import { Panel } from '@/app/components/ui/Panel.comp';
import { PanelEyebrow } from '@/app/components/ui/PanelEyebrow.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { addDaysToDateKey, type Clash, type DateRange, type NoteOccurrence, type Session } from '@/app/schedule';
import { agendaFor, dueSoon, formatSessionDate, joinNames, mergeDay, sessionRoom } from '../util';
import { AgendaNoteRow } from './AgendaNoteRow.comp';
import { AgendaRow } from './AgendaRow.comp';
import { DueSoonList } from './DueSoonList.comp';
import { NextClassCard } from './NextClassCard.comp';

interface Props {
  dateKey: string;
  todayKey: string;
  now: Date;
  attended: Session[];
  skipped: Session[];
  sessionsById: Map<string, Session>;
  clashesBySession: Map<string, Clash[]>;
  rooms: Record<string, RoomInfo>;
  range: DateRange;
  notes: NoteOccurrence[];
  deadlines: CalendarDeadline[];
  locale: string;
}

export const DayAgenda: React.FC<Props> = ({
  dateKey,
  todayKey,
  now,
  attended,
  skipped,
  sessionsById,
  clashesBySession,
  rooms,
  range,
  notes,
  deadlines,
  locale,
}) => {
  const { t } = useTranslationWithPrefix('views.calendar');
  const roomLabels = { noRoom: t('event.noRoom'), unavailable: t('event.roomUnavailable') };
  const agenda = useMemo(
    () => agendaFor(attended, skipped, dateKey, now, range),
    [attended, skipped, dateKey, now, range],
  );
  const skippedIds = useMemo(() => new Set(skipped.map((session) => session.id)), [skipped]);
  const entries = useMemo(
    () =>
      mergeDay(
        agenda.day,
        notes.filter((note) => note.dateKey === dateKey),
      ),
    [agenda.day, notes, dateKey],
  );
  const soon = useMemo(() => dueSoon(deadlines, now), [deadlines, now]);
  const isToday = dateKey === todayKey;
  const clashNamesOf = (session: Session): string | null => {
    const names = (clashesBySession.get(session.id) ?? [])
      .flatMap((clash) => clash.sessionIds.filter((id) => id !== session.id))
      .map((id) => sessionsById.get(id)?.courseName)
      .filter((name): name is string => name != null);
    return names.length > 0 ? joinNames([...new Set(names)], locale) : null;
  };
  const subtitleOf = (session: Session): string =>
    skippedIds.has(session.id)
      ? t('agenda.skipping')
      : `${t(`kinds.${session.kind}`)} · ${sessionRoom(session, rooms, roomLabels)}`;
  const followingLabel = agenda.following
    ? isToday && agenda.following.dateKey === addDaysToDateKey(dateKey, 1)
      ? t('agenda.tomorrowFirst')
      : t('agenda.firstOn', { date: formatSessionDate(agenda.following.dateKey, locale) })
    : null;

  return (
    <Panel
      className="max-lg:hidden"
      header={
        <div>
          <PanelEyebrow>{t('agenda.title')}</PanelEyebrow>
          <p className="text-sm font-semibold text-offwhite">
            {isToday ? t('agenda.today') : formatSessionDate(dateKey, locale)}
          </p>
        </div>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-3.5">
        {agenda.next ? (
          <NextClassCard
            session={agenda.next}
            now={now}
            room={sessionRoom(agenda.next, rooms, roomLabels)}
            clashNames={clashNamesOf(agenda.next)}
            locale={locale}
          />
        ) : (
          agenda.nextKnown && <p className="text-[12.5px] text-lightGrey">{t('agenda.noUpcoming')}</p>
        )}
        <section>
          <PanelEyebrow>
            {isToday ? t('agenda.restOfToday') : t('agenda.onDay', { date: formatSessionDate(dateKey, locale) })}
          </PanelEyebrow>
          {entries.length === 0 ? (
            <p className="mt-1.5 text-[12.5px] text-lightGrey">{t('states.emptyDay')}</p>
          ) : (
            <div className="mt-1">
              {entries.map((entry) =>
                entry.type === 'session' ? (
                  <AgendaRow
                    key={entry.session.id}
                    session={entry.session}
                    subtitle={subtitleOf(entry.session)}
                    isFaded={entry.session.end <= now || skippedIds.has(entry.session.id)}
                  />
                ) : (
                  <AgendaNoteRow
                    key={entry.note.id}
                    note={entry.note}
                    subtitle={t('notes.agendaSubtitle')}
                    isFaded={entry.note.end <= now}
                  />
                ),
              )}
            </div>
          )}
        </section>
        <DueSoonList deadlines={soon} todayKey={todayKey} locale={locale} />
        {agenda.following && followingLabel && (
          <section>
            <PanelEyebrow>{followingLabel}</PanelEyebrow>
            <div className="mt-1">
              <AgendaRow session={agenda.following} subtitle={subtitleOf(agenda.following)} isFaded={false} />
            </div>
          </section>
        )}
      </div>
    </Panel>
  );
};
