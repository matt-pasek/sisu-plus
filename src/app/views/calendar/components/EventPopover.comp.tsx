import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import type {
  CalendarCourse,
  CourseUnitInfo,
  LinkedTimetableState,
  RoomInfo,
} from '@/app/api/dataPoints/calendar/types';
import { StatusChip } from '@/app/components/ui/StatusChip.comp';
import { formatCredits } from '@/app/helpers/formatCredits';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import type { SeriesClashSummary, Session } from '@/app/schedule';
import { getModuleColorValueByIndex } from '@/app/theme/moduleColors';
import type { PopoverModel, PopoverTarget } from '../types';
import {
  describeRoom,
  describeRoomWithBuilding,
  formatClock,
  formatSessionDate,
  joinNames,
  placePopover,
  shortGroupName,
} from '../util';
import { ClashBox } from './ClashBox.comp';
import { CalendarIcon, ClockIcon, CloseIcon, PinIcon } from './icons';
import { OtherTimesList } from './OtherTimesList.comp';
import { PopoverActions } from './PopoverActions.comp';
import { SessionChipBadge } from './SessionChipBadge.comp';
import { SwapSuggestion } from './SwapSuggestion.comp';

const POPOVER_WIDTH = 372;
const DEFAULT_HEIGHT = 320;
const POPOVER_EASE = [0.22, 1, 0.36, 1] as const;
const SKIP_BUTTON_CLASS = 'cursor-pointer font-semibold underline-offset-2 hover:underline';

interface Props {
  target: PopoverTarget;
  series: Session[];
  summary: SeriesClashSummary;
  rooms: Record<string, RoomInfo>;
  course: CalendarCourse | undefined;
  courseUnit: CourseUnitInfo | undefined;
  locale: string;
  model: PopoverModel;
  linkedState?: LinkedTimetableState;
  onClose: () => void;
}

export const EventPopover: React.FC<Props> = ({
  target,
  series,
  summary,
  rooms,
  course,
  courseUnit,
  locale,
  model,
  linkedState,
  onClose,
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
  const teachingLine = [shortGroupName(session.groupName, courseUnit?.code ?? null), course?.realisationName]
    .filter(Boolean)
    .join(' · ');
  const isLinked = session.source === 'linked';
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
      className="fixed z-50 overflow-hidden rounded-[14px] bg-container shadow-[0_0_0_1px_rgba(255,255,255,0.09),0_24px_60px_rgba(0,0,0,0.6)] outline-none"
      style={{
        top: placement.top,
        left: placement.left,
        width: POPOVER_WIDTH,
        transformOrigin: placement.side === 'right' ? 'left center' : 'right center',
      }}
    >
      <div className="flex items-start gap-3.5 px-[18px] pt-4 pb-3.5">
        <span
          aria-hidden="true"
          className="w-1 shrink-0 self-stretch rounded-full"
          style={{ backgroundColor: color }}
        />
        <div className="min-w-0 flex-1">
          <h3 className="text-[15.5px] leading-[1.3] font-semibold text-balance text-offwhite">{session.courseName}</h3>
          {(courseUnit || course?.isExam) && (
            <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-lightGrey">
              {courseUnit && (
                <>
                  <span>{courseUnit.code}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold text-[#7ea0ff]">{formatCredits(courseUnit.credits)}</span>
                </>
              )}
              {course?.isExam && (
                <>
                  {courseUnit && <span aria-hidden="true">·</span>}
                  <span className="font-semibold text-[#a98cff]">{t('sidebar.exam')}</span>
                </>
              )}
            </p>
          )}
        </div>
        <button
          type="button"
          aria-label={t('actions.close')}
          onClick={onClose}
          className="relative -mt-1 -mr-1.5 cursor-pointer rounded-md p-1 text-lightGrey transition-colors duration-150 after:absolute after:-inset-2 after:content-[''] hover:text-offwhite"
        >
          <CloseIcon className="size-4" />
        </button>
      </div>
      <dl className="grid grid-cols-[18px_minmax(0,1fr)] gap-x-2.5 gap-y-3 border-t border-border px-[18px] py-[13px] text-[12.5px]">
        <dt className="pt-px text-darkishGrey">
          <CalendarIcon className="size-3.5" />
        </dt>
        <dd className="min-w-0">
          <span className="flex items-center gap-2 font-medium text-offwhite">
            <span className="truncate">{kindLabel}</span>
            {session.cancelled && <StatusChip tone="neutral">{t('sessions.chips.cancelled')}</StatusChip>}
            {model.status === 'alternative' && <StatusChip tone="neutral">{t('event.alternativeChip')}</StatusChip>}
            {model.badge && <SessionChipBadge chip={{ type: model.badge }} />}
          </span>
          <span className="block truncate text-[11.5px] text-lightGrey">
            {linkedState
              ? linkedState.fetchedAt != null
                ? t('event.fromSource', {
                    source: linkedState.label,
                    time: formatClock(new Date(linkedState.fetchedAt)),
                  })
                : t('event.fromSourcePlain', { source: linkedState.label })
              : teachingLine}
          </span>
        </dd>
        <dt className="pt-px text-darkishGrey">
          <ClockIcon className="size-3.5" />
        </dt>
        <dd>
          <span className="font-mono text-offwhite tabular-nums">
            {formatSessionDate(session.dateKey, locale)} · {formatClock(session.start)}–{formatClock(session.end)}
          </span>
          {position >= 0 && (
            <span className="block text-[11.5px] text-lightGrey">
              {t('event.session', { index: position + 1, total: series.length })}
            </span>
          )}
        </dd>
        <dt className="pt-px text-darkishGrey">
          <PinIcon className="size-3.5" />
        </dt>
        <dd className="text-offwhite">
          {isLinked
            ? (session.locationText ?? roomLabels.noRoom)
            : describeRoomWithBuilding(session.locationIds, rooms, roomLabels)}
          {next && !isLinked && (
            <span className={`block text-[11.5px] ${nextMoves ? 'text-blue-300' : 'text-lightGrey'}`}>
              {t(nextMoves ? 'event.nextSessionMoves' : 'event.nextSession', {
                date: formatSessionDate(next.dateKey, locale),
                room: describeRoom(next.locationIds, rooms, roomLabels),
              })}
            </span>
          )}
        </dd>
      </dl>
      {model.otherTimes.length > 0 && (
        <OtherTimesList sessions={model.otherTimes} rooms={rooms} locale={locale} onGo={model.handlers.onGoTo} />
      )}
      {summary.clashing > 0 && (
        <ClashBox
          summary={summary}
          label={t('event.clashesWith', { names: otherNames, count: summary.clashing, total: summary.total })}
        >
          {model.suggestion && (
            <SwapSuggestion
              suggestion={model.suggestion}
              locale={locale}
              onSwitch={model.handlers.onSwitchToSuggestion}
              onKeep={model.handlers.onKeep}
            />
          )}
          {model.partner && (
            <div className="mt-2 flex flex-wrap gap-3 text-[11.5px]">
              <button type="button" className={SKIP_BUTTON_CLASS} onClick={() => model.handlers.onSkip(false)}>
                {t('actions.skipOnce')}
              </button>
              <button type="button" className={SKIP_BUTTON_CLASS} onClick={() => model.handlers.onSkip(true)}>
                {t('actions.skipAlways')}
              </button>
            </div>
          )}
        </ClashBox>
      )}
      <PopoverActions model={model} />
    </motion.div>
  );
};
