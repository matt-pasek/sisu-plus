import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import type { CourseUnitInfo, RoomInfo } from '@/app/api/dataPoints/calendar/types';
import { Button } from '@/app/components/ui/Button.comp';
import { StatusChip } from '@/app/components/ui/StatusChip.comp';
import { formatCredits } from '@/app/helpers/formatCredits';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import type { SeriesClashSummary, Session } from '@/app/schedule';
import { getModuleColorValueByIndex } from '@/app/theme/moduleColors';
import type { PopoverTarget } from '../types';
import {
  describeRoom,
  describeRoomWithBuilding,
  formatClock,
  formatSessionDate,
  joinNames,
  placePopover,
} from '../util';
import { ClashBox } from './ClashBox.comp';
import { ClockIcon, CloseIcon, ListIcon, PinIcon } from './icons';

const POPOVER_WIDTH = 372;
const DEFAULT_HEIGHT = 320;
const POPOVER_EASE = [0.22, 1, 0.36, 1] as const;

interface Props {
  target: PopoverTarget;
  series: Session[];
  summary: SeriesClashSummary;
  rooms: Record<string, RoomInfo>;
  courseUnit: CourseUnitInfo | undefined;
  locale: string;
  onClose: () => void;
  onShowAllSessions: (seriesId: string) => void;
}

export const EventPopover: React.FC<Props> = ({
  target,
  series,
  summary,
  rooms,
  courseUnit,
  locale,
  onClose,
  onShowAllSessions,
}) => {
  const { t } = useTranslationWithPrefix('views.calendar');
  const shouldReduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const lastAnchor = useRef(target.element);
  const [height, setHeight] = useState(DEFAULT_HEIGHT);
  const { session, element } = target;
  const color = getModuleColorValueByIndex(session.colorIndex);
  const roomLabels = { noRoom: t('event.noRoom'), unavailable: t('event.roomUnavailable') };
  const position = series.findIndex((item) => item.id === session.id);
  const next = position >= 0 ? series[position + 1] : undefined;
  const nextMoves = next != null && next.locationIds.join() !== session.locationIds.join();
  const kindLabel = t(`kinds.${session.kind}`);
  const otherNames = joinNames(
    summary.otherSessions.map((other) => `${other.courseName} ${t(`kinds.${other.kind}`).toLowerCase()}`),
    locale,
  );

  useLayoutEffect(() => {
    setHeight(ref.current?.offsetHeight ?? DEFAULT_HEIGHT);
    ref.current?.focus();
  }, [session.id]);

  useEffect(() => {
    lastAnchor.current = element;
  }, [element]);

  // Restore focus only when the popover closes, not when it moves to another session.
  useEffect(() => () => lastAnchor.current.focus({ preventScroll: true }), []);

  // Clicks inside the shadow root reach document retargeted to the host, so containment is read from the path.
  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const path = event.composedPath();
      if ((ref.current && path.includes(ref.current)) || path.includes(element)) return;
      onClose();
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [element, onClose]);

  const placement = placePopover(
    element.getBoundingClientRect(),
    { width: POPOVER_WIDTH, height },
    { width: window.innerWidth, height: window.innerHeight },
  );

  return (
    <motion.div
      ref={ref}
      role="dialog"
      aria-label={session.courseName}
      tabIndex={-1}
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: shouldReduceMotion ? 0.1 : 0.16, ease: POPOVER_EASE }}
      className="fixed z-50 rounded-[14px] bg-container2 shadow-[0_0_0_1px_rgba(255,255,255,0.09),0_24px_60px_rgba(0,0,0,0.6)] outline-none"
      style={{
        top: placement.top,
        left: placement.left,
        width: POPOVER_WIDTH,
        transformOrigin: placement.side === 'right' ? 'left center' : 'right center',
      }}
    >
      <div className="flex items-start gap-3 px-4 pt-3.5 pb-2.5">
        <span
          aria-hidden="true"
          className="w-1 shrink-0 self-stretch rounded-full"
          style={{ backgroundColor: color }}
        />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 font-mono text-[10px] font-semibold tracking-[0.12em] text-lightGrey uppercase">
            <span className="truncate">{session.groupName ? `${kindLabel} · ${session.groupName}` : kindLabel}</span>
            {session.cancelled && <StatusChip tone="neutral">{t('sessions.chips.cancelled')}</StatusChip>}
          </p>
          <h3 className="text-[15px] leading-snug font-semibold text-balance text-offwhite">{session.courseName}</h3>
          {courseUnit && (
            <p className="font-mono text-[11px] text-lightGrey">
              {courseUnit.code} · {formatCredits(courseUnit.credits)}
            </p>
          )}
        </div>
        <button
          type="button"
          aria-label={t('actions.close')}
          onClick={onClose}
          className="cursor-pointer rounded-md p-1 text-lightGrey transition-colors duration-150 hover:text-offwhite"
        >
          <CloseIcon className="size-4" />
        </button>
      </div>
      <dl className="grid grid-cols-[22px_minmax(0,1fr)] gap-x-2 gap-y-2.5 px-4 pb-3 text-[13px]">
        <dt className="pt-0.5 text-lightGrey">
          <ClockIcon className="size-[15px]" />
        </dt>
        <dd className="text-offwhite">
          <span className="font-mono tabular-nums">
            {formatSessionDate(session.dateKey, locale)} · {formatClock(session.start)}–{formatClock(session.end)}
          </span>
          {position >= 0 && (
            <span className="block text-[11.5px] text-lightGrey">
              {t('event.session', { index: position + 1, total: series.length })}
            </span>
          )}
        </dd>
        <dt className="pt-0.5 text-lightGrey">
          <PinIcon className="size-[15px]" />
        </dt>
        <dd className="text-offwhite">
          {describeRoomWithBuilding(session.locationIds, rooms, roomLabels)}
          {next && (
            <span className={`block text-[11.5px] ${nextMoves ? 'text-blue-300' : 'text-lightGrey'}`}>
              {t(nextMoves ? 'event.nextSessionMoves' : 'event.nextSession', {
                date: formatSessionDate(next.dateKey, locale),
                room: describeRoom(next.locationIds, rooms, roomLabels),
              })}
            </span>
          )}
        </dd>
      </dl>
      {summary.clashing > 0 && (
        <ClashBox
          summary={summary}
          label={t('event.clashesWith', { names: otherNames, count: summary.clashing, total: summary.total })}
        />
      )}
      <div className="flex gap-1.5 border-t border-border2 px-3 py-2.5">
        <Button
          variant="onSurface"
          className="min-h-8 px-2.5"
          onClick={() => onShowAllSessions(session.seriesId)}
          icon={<ListIcon className="size-3.5" />}
        >
          {t('actions.allSessions')}
        </Button>
      </div>
    </motion.div>
  );
};
