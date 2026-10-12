import React, { useMemo, useRef } from 'react';
import type { CalendarDeadline, CourseUnitInfo, RoomInfo } from '@/app/api/dataPoints/calendar/types';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import {
  helsinkiMinutesOfDay,
  visibleHourRange,
  type Clash,
  type HourRange,
  type NoteOccurrence,
  type Session,
} from '@/app/schedule';
import { useElementHeight } from '../hooks/useElementHeight';
import type { AllDayItem, AnchorRect, NoteSlot, SessionBadge } from '../types';
import { fitHourHeight, formatClock, minutesToOffset, sessionsOnDay, slotBlock, weekendHasContent } from '../util';
import { AllDayRow } from './AllDayRow.comp';
import { HourGutter } from './HourGutter.comp';
import { WeekDayColumn } from './WeekDayColumn.comp';
import { WeekDayHeader } from './WeekDayHeader.comp';

const HOUR_BOUNDS = { min: 52, max: 120 };
const GRID_INSET = 10;
const DEFAULT_HOURS: HourRange = { startHour: 8, endHour: 18 };
const WEEKDAYS = 5;

interface Props {
  dayKeys: string[];
  collapseWeekend: boolean;
  detailed: boolean;
  emptyLabel: string;
  todayKey: string;
  now: Date;
  sessions: Session[];
  alternatives: Session[];
  preview: Session[];
  notes: NoteOccurrence[];
  draft: NoteSlot | null;
  draftTitle: string;
  previewClashIds: Set<string>;
  sessionsById: Map<string, Session>;
  clashesBySession: Map<string, Clash[]>;
  badges: Map<string, SessionBadge>;
  rooms: Record<string, RoomInfo>;
  courseUnits: Record<string, CourseUnitInfo>;
  linkedLabels: Record<string, string>;
  activeSessionId: string | null;
  locale: string;
  onSelect: (session: Session, element: HTMLElement) => void;
  onSelectNote: (note: NoteOccurrence, element: HTMLElement) => void;
  onDraft: (slot: NoteSlot, anchor: AnchorRect) => void;
  allDay: Record<string, AllDayItem[]>;
  onOpenDay: (dateKey: string) => void;
  onSelectDeadline: (deadline: CalendarDeadline, element: HTMLElement) => void;
  onUserScroll: () => void;
}

export const WeekGrid: React.FC<Props> = ({
  dayKeys,
  collapseWeekend,
  detailed,
  emptyLabel,
  todayKey,
  now,
  sessions,
  alternatives,
  preview,
  notes,
  draft,
  draftTitle,
  previewClashIds,
  sessionsById,
  clashesBySession,
  badges,
  rooms,
  courseUnits,
  linkedLabels,
  activeSessionId,
  locale,
  onSelect,
  onSelectNote,
  onDraft,
  allDay,
  onOpenDay,
  onSelectDeadline,
  onUserScroll,
}) => {
  const { t } = useTranslationWithPrefix('views.calendar');
  const scrollRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const viewportHeight = useElementHeight(scrollRef);
  const visibleNotes = useMemo(() => notes.filter((note) => dayKeys.includes(note.dateKey)), [notes, dayKeys]);
  const draftBlock = useMemo(
    () => (draft && draft.endMinutes > draft.startMinutes && dayKeys.includes(draft.dateKey) ? slotBlock(draft) : null),
    [draft, dayKeys],
  );
  const hourRange = useMemo(
    () =>
      visibleHourRange(
        [...sessions, ...alternatives, ...preview, ...visibleNotes, ...(draftBlock ? [draftBlock] : [])],
        DEFAULT_HOURS,
      ),
    [sessions, alternatives, preview, visibleNotes, draftBlock],
  );
  const days = useMemo(
    () =>
      dayKeys.map((dateKey) => ({
        dateKey,
        sessions: sessionsOnDay(sessions, dateKey),
        alternatives: sessionsOnDay(alternatives, dateKey),
        preview: sessionsOnDay(preview, dateKey),
        notes: sessionsOnDay(visibleNotes, dateKey),
      })),
    [dayKeys, sessions, alternatives, preview, visibleNotes],
  );
  const weekendEmpty =
    collapseWeekend &&
    !weekendHasContent(
      dayKeys.slice(WEEKDAYS),
      [...sessions, ...alternatives, ...visibleNotes, ...(draftBlock ? [draftBlock] : [])],
      allDay,
    );
  const columns = weekendEmpty ? days.slice(0, WEEKDAYS) : days;
  const template = `52px repeat(${columns.length}, minmax(0, 1fr))${weekendEmpty ? ' 34px' : ''}`;
  const hours = Array.from({ length: hourRange.endHour - hourRange.startHour }, (_, i) => hourRange.startHour + i);
  const hourHeight = fitHourHeight(
    viewportHeight - (headerRef.current?.offsetHeight ?? 0) - 2 * GRID_INSET,
    hours.length,
    HOUR_BOUNDS,
  );
  const nowMinutes = helsinkiMinutesOfDay(now);
  const showNowLabel =
    columns.some(({ dateKey }) => dateKey === todayKey) &&
    nowMinutes >= hourRange.startHour * 60 &&
    nowMinutes <= hourRange.endHour * 60;

  return (
    // Only user input closes the popover; scroll events also fire for scrollIntoView from the clash chip.
    <div
      ref={scrollRef}
      className="relative min-h-0 flex-1 overflow-y-auto bg-background"
      onWheel={onUserScroll}
      onTouchMove={onUserScroll}
    >
      <div
        ref={headerRef}
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
        {columns.some(({ dateKey }) => (allDay[dateKey] ?? []).length > 0) && (
          <AllDayRow
            dayKeys={columns.map(({ dateKey }) => dateKey)}
            weekendCollapsed={weekendEmpty}
            itemsByDay={allDay}
            now={now}
            locale={locale}
            onOpenDay={onOpenDay}
            onSelectDeadline={onSelectDeadline}
          />
        )}
      </div>
      <div
        className="relative grid"
        style={{ gridTemplateColumns: template, height: hours.length * hourHeight + 2 * GRID_INSET }}
      >
        <HourGutter
          hours={hours}
          hourHeight={hourHeight}
          inset={GRID_INSET}
          nowLabel={
            showNowLabel ? { top: minutesToOffset(nowMinutes, hourRange, hourHeight), text: formatClock(now) } : null
          }
        />
        {columns.map(
          ({ dateKey, sessions: daySessions, alternatives: dayAlternatives, preview: dayPreview, notes: dayNotes }) => (
            <WeekDayColumn
              key={dateKey}
              dateKey={dateKey}
              isToday={dateKey === todayKey}
              now={now}
              sessions={daySessions}
              alternatives={dayAlternatives}
              preview={dayPreview}
              notes={dayNotes}
              draft={draftBlock?.dateKey === dateKey ? draftBlock : null}
              draftTitle={draftTitle}
              previewClashIds={previewClashIds}
              sessionsById={sessionsById}
              hourRange={hourRange}
              hourHeight={hourHeight}
              inset={GRID_INSET}
              clashesBySession={clashesBySession}
              badges={badges}
              rooms={rooms}
              courseUnits={courseUnits}
              linkedLabels={linkedLabels}
              detailed={detailed}
              activeSessionId={activeSessionId}
              locale={locale}
              onSelect={onSelect}
              onSelectNote={onSelectNote}
              onDraft={(times, anchor) => onDraft({ dateKey, ...times }, anchor)}
            />
          ),
        )}
        {weekendEmpty && (
          <div className="relative border-l border-border bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.012)_0_6px,transparent_6px_12px)]">
            <span className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90 font-mono text-[10px] font-medium tracking-[0.08em] whitespace-nowrap text-darkishGrey uppercase">
              {t('weekendFree')}
            </span>
          </div>
        )}
      </div>
      {columns.every((day) => day.sessions.length === 0 && day.alternatives.length === 0 && day.notes.length === 0) && (
        <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-lightGrey">
          {emptyLabel}
        </p>
      )}
    </div>
  );
};
