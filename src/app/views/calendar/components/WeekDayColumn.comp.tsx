import React, { useMemo, useRef } from 'react';
import { isPendingNote } from '@/app/api/dataPoints/calendar/notes';
import type { CourseUnitInfo, RoomInfo } from '@/app/api/dataPoints/calendar/types';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import {
  helsinkiMinutesOfDay,
  layoutDay,
  type Clash,
  type HourRange,
  type NoteOccurrence,
  type Session,
  type TimedBlock,
} from '@/app/schedule';
import { useElementMeasure } from '../hooks/useElementMeasure';
import { useNoteDrag } from '../hooks/useNoteDrag';
import type { AnchorRect, ClashGroupRow, SessionBadge } from '../types';
import {
  describeRoom,
  describeRoomShort,
  describeRoomWithBuilding,
  formatClock,
  formatSessionDate,
  groupBlock,
  joinNames,
  lanesThatFit,
  minutesToOffset,
  sessionBox,
  sessionRoom,
  shortGroupName,
  slotBlock,
  splitOverlaps,
} from '../util';
import { AlternativeBlock } from './AlternativeBlock.comp';
import { ClashGroupBlock } from './ClashGroupBlock.comp';
import { NoteBlock } from './NoteBlock.comp';
import { NowLine } from './NowLine.comp';
import { OVERFLOW_STRIP_WIDTH, OverflowChip } from './OverflowChip.comp';
import { SessionBlock } from './SessionBlock.comp';

interface Props {
  dateKey: string;
  isToday: boolean;
  now: Date;
  sessions: Session[];
  alternatives: Session[];
  preview: Session[];
  notes: NoteOccurrence[];
  draft: TimedBlock | null;
  draftTitle: string;
  previewClashIds: Set<string>;
  sessionsById: Map<string, Session>;
  hourRange: HourRange;
  hourHeight: number;
  inset: number;
  clashesBySession: Map<string, Clash[]>;
  badges: Map<string, SessionBadge>;
  rooms: Record<string, RoomInfo>;
  courseUnits: Record<string, CourseUnitInfo>;
  linkedLabels: Record<string, string>;
  detailed: boolean;
  activeSessionId: string | null;
  locale: string;
  onSelect: (session: Session, element: HTMLElement) => void;
  onSelectNote: (note: NoteOccurrence, element: HTMLElement) => void;
  onDraft: (times: { startMinutes: number; endMinutes: number }, anchor: AnchorRect) => void;
}

export const WeekDayColumn: React.FC<Props> = ({
  dateKey,
  isToday,
  now,
  sessions,
  alternatives,
  preview,
  notes,
  draft,
  draftTitle,
  previewClashIds,
  sessionsById,
  hourRange,
  hourHeight,
  inset,
  clashesBySession,
  badges,
  rooms,
  courseUnits,
  linkedLabels,
  detailed,
  activeSessionId,
  locale,
  onSelect,
  onSelectNote,
  onDraft,
}) => {
  const { t } = useTranslationWithPrefix('views.calendar');
  const columnRef = useRef<HTMLDivElement>(null);
  const fittingLanes = useElementMeasure(columnRef, lanesThatFit, Infinity);
  const { liveTimes, handlers } = useNoteDrag({ hourRange, hourHeight, inset, onDraft });
  const shownDraft = useMemo(
    () => (liveTimes ? slotBlock({ dateKey, ...liveTimes }) : draft),
    [liveTimes, draft, dateKey],
  );
  const mergedGroups = useMemo(() => {
    if (detailed) return [];
    const lanes = layoutDay(sessions).placements;
    return splitOverlaps(sessions).groups.filter((group) => (lanes[group[0].id]?.cols ?? group.length) > fittingLanes);
  }, [sessions, detailed, fittingLanes]);
  const groups = useMemo(() => mergedGroups.map((group) => ({ block: groupBlock(group), group })), [mergedGroups]);
  const groupsById = useMemo(() => new Map(groups.map(({ block, group }) => [block.id, group])), [groups]);
  const singleSessions = useMemo(() => {
    const merged = new Set(mergedGroups.flat().map((session) => session.id));
    return sessions.filter((session) => !merged.has(session.id));
  }, [sessions, mergedGroups]);
  const layout = useMemo(
    () =>
      layoutDay([
        ...singleSessions,
        ...groups.map(({ block }) => block),
        ...preview,
        ...notes,
        ...(shownDraft ? [shownDraft] : []),
      ]),
    [singleSessions, groups, preview, notes, shownDraft],
  );
  const notesById = useMemo(() => new Map(notes.map((note) => [note.id, note])), [notes]);
  const alternativeLayout = useMemo(() => layoutDay(alternatives), [alternatives]);
  const roomLabels = { noRoom: t('event.noRoom'), unavailable: t('event.roomUnavailable') };
  const nowMinutes = helsinkiMinutesOfDay(now);
  const showNow = isToday && nowMinutes >= hourRange.startHour * 60 && nowMinutes <= hourRange.endHour * 60;
  const inOverflowCluster = (block: TimedBlock): boolean =>
    layout.overflow.some((slot) => block.start < slot.end && block.end > slot.start);

  const draftBox = shownDraft ? sessionBox(shownDraft, hourRange, hourHeight) : null;
  const draftPlacement = shownDraft ? layout.placements[shownDraft.id] : undefined;

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

  const groupRow = (session: Session): ClashGroupRow => {
    const badge = badges.get(session.id) ?? null;
    const linkedLabel = session.source !== 'sisu' ? linkedLabels[session.courseKey] : undefined;
    return {
      session,
      ariaLabel: ariaLabelFor(
        session,
        sessionRoom(session, rooms, roomLabels, describeRoom),
        clashesBySession.get(session.id) ?? [],
      ),
      detail: [t(`kinds.${session.kind}`), sessionRoom(session, rooms, roomLabels, describeRoomShort), linkedLabel]
        .filter(Boolean)
        .join(' · '),
      status: badge ? t(`sessions.chips.${badge}`) : session.cancelled ? t('sessions.chips.cancelled') : null,
    };
  };

  return (
    <div
      ref={columnRef}
      className={`relative border-l border-border ${isToday ? 'bg-accent/[0.025]' : ''}`}
      style={{
        backgroundImage: `repeating-linear-gradient(to bottom, rgba(34,34,40,0.8) 0, rgba(34,34,40,0.8) 1px, transparent 1px, transparent ${hourHeight}px)`,
        backgroundPosition: `0 ${inset}px`,
      }}
      {...handlers}
    >
      {alternatives.map((session) => {
        const placement = alternativeLayout.placements[session.id];
        if (!placement) return null;
        const box = sessionBox(session, hourRange, hourHeight);
        return (
          <AlternativeBlock
            key={`alt-${session.id}`}
            session={session}
            placement={placement}
            box={{ ...box, top: box.top + inset }}
            variant="alternative"
            isClashing={false}
            ariaLabel={t('aria.alternative', {
              course: session.courseName,
              group: session.groupName ?? '',
              date: formatSessionDate(dateKey, locale),
              start: formatClock(session.start),
              end: formatClock(session.end),
            })}
            onSelect={onSelect}
          />
        );
      })}
      {groups.map(({ block, group }) => {
        const placement = layout.placements[block.id];
        if (!placement) return null;
        const box = sessionBox(block, hourRange, hourHeight);
        return (
          <ClashGroupBlock
            key={block.id}
            block={block}
            rows={group.map(groupRow)}
            placement={placement}
            box={{ ...box, top: box.top + inset }}
            reservedRight={inOverflowCluster(block) ? OVERFLOW_STRIP_WIDTH : 0}
            isClashing={group.some((session) => (clashesBySession.get(session.id) ?? []).length > 0)}
            activeSessionId={activeSessionId}
            now={now}
            onSelect={onSelect}
          />
        );
      })}
      {singleSessions.map((session) => {
        const placement = layout.placements[session.id];
        if (!placement) return null;
        const clashes = clashesBySession.get(session.id) ?? [];
        const badge = badges.get(session.id) ?? null;
        const isLinked = session.source !== 'sisu';
        const room = sessionRoom(session, rooms, roomLabels, describeRoom);
        const roomName = sessionRoom(
          session,
          rooms,
          roomLabels,
          detailed ? describeRoomWithBuilding : describeRoomShort,
        );
        const box = sessionBox(session, hourRange, hourHeight);
        const code = session.courseUnitId ? (courseUnits[session.courseUnitId]?.code ?? null) : null;
        return (
          <SessionBlock
            key={session.id}
            session={session}
            placement={placement}
            box={{ ...box, top: box.top + inset }}
            reservedRight={inOverflowCluster(session) ? OVERFLOW_STRIP_WIDTH : 0}
            code={code}
            isClashing={clashes.length > 0}
            isActive={activeSessionId === session.id}
            isDimmed={activeSessionId != null && activeSessionId !== session.id}
            isPast={session.end <= now}
            kindLabel={t(`kinds.${session.kind}`)}
            roomName={roomName}
            detail={detailed && !isLinked ? shortGroupName(session.groupName, code) : null}
            ariaLabel={ariaLabelFor(session, room, clashes)}
            badge={badge}
            badgeLabel={badge ? t(`sessions.chips.${badge}`) : null}
            sourceLabel={isLinked ? (linkedLabels[session.courseKey] ?? null) : null}
            onSelect={onSelect}
          />
        );
      })}
      {notes.map((note) => {
        const placement = layout.placements[note.id];
        if (!placement) return null;
        const box = sessionBox(note, hourRange, hourHeight);
        const pending = isPendingNote(note.noteId);
        return (
          <NoteBlock
            key={note.id}
            placement={placement}
            box={{ ...box, top: box.top + inset }}
            reservedRight={inOverflowCluster(note) ? OVERFLOW_STRIP_WIDTH : 0}
            title={note.name}
            timeLabel={`${formatClock(note.start)}–${formatClock(note.end)}`}
            ariaLabel={[
              t('notes.aria', {
                name: note.name,
                date: formatSessionDate(dateKey, locale),
                start: formatClock(note.start),
                end: formatClock(note.end),
              }),
              pending ? t('notes.pending') : null,
            ]
              .filter(Boolean)
              .join(', ')}
            variant={pending ? 'pending' : 'saved'}
            isPast={note.end <= now}
            onSelect={pending ? undefined : (element) => onSelectNote(note, element)}
          />
        );
      })}
      {shownDraft && draftBox && draftPlacement && (
        <NoteBlock
          placement={draftPlacement}
          box={{ ...draftBox, top: draftBox.top + inset }}
          reservedRight={0}
          title={draftTitle}
          timeLabel={`${formatClock(shownDraft.start)}–${formatClock(shownDraft.end)}`}
          ariaLabel=""
          variant="draft"
          isPast={false}
        />
      )}
      {preview.map((session) => {
        const placement = layout.placements[session.id];
        if (!placement) return null;
        const box = sessionBox(session, hourRange, hourHeight);
        return (
          <AlternativeBlock
            key={`preview-${session.id}`}
            session={session}
            placement={placement}
            box={{ ...box, top: box.top + inset }}
            variant="preview"
            isClashing={previewClashIds.has(session.id)}
            ariaLabel=""
          />
        );
      })}
      {layout.overflow.map((slot) => {
        const hidden = slot.sessionIds.flatMap((id) => {
          const session = sessionsById.get(id);
          return groupsById.get(id) ?? (session ? [session] : []);
        });
        const hiddenNotes = slot.sessionIds
          .map((id) => notesById.get(id))
          .filter((note): note is NoteOccurrence => note != null);
        return (
          <OverflowChip
            key={slot.sessionIds.join()}
            top={minutesToOffset(helsinkiMinutesOfDay(slot.start), hourRange, hourHeight) + inset}
            count={hidden.length + hiddenNotes.length}
            ariaLabel={t('aria.moreSessions', {
              count: hidden.length + hiddenNotes.length,
              names: joinNames(
                [
                  ...hidden.map((session) => `${session.courseName} ${formatClock(session.start)}`),
                  ...hiddenNotes.map((note) => `${note.name} ${formatClock(note.start)}`),
                ],
                locale,
              ),
            })}
            onOpen={(element) => {
              if (hidden[0]) onSelect(hidden[0], element);
              else if (hiddenNotes[0]) onSelectNote(hiddenNotes[0], element);
            }}
          />
        );
      })}
      {showNow && <NowLine top={minutesToOffset(nowMinutes, hourRange, hourHeight) + inset} />}
    </div>
  );
};
