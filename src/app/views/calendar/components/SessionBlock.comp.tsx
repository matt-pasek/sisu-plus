import React from 'react';
import { StatusChip } from '@/app/components/ui/StatusChip.comp';
import type { StatusTone } from '@/app/components/ui/types';
import type { Placement, Session } from '@/app/schedule';
import { getModuleColorValueByIndex } from '@/app/theme/moduleColors';
import type { SessionBadge } from '../types';
import { formatClock } from '../util';
import { PinIcon, WarningIcon } from './icons';

const META_HEIGHT = 64;
const BADGE_TONE: Record<SessionBadge, StatusTone> = { swapped: 'info', skipping: 'neutral', swapUnavailable: 'warn' };

interface Props {
  session: Session;
  placement: Placement;
  box: { top: number; height: number };
  reservedRight: number;
  code: string | null;
  isClashing: boolean;
  isActive: boolean;
  isDimmed: boolean;
  isPast: boolean;
  kindLabel: string;
  roomName: string;
  ariaLabel: string;
  badge: SessionBadge | null;
  badgeLabel: string | null;
  sourceLabel: string | null;
  detail: string | null;
  onSelect: (session: Session, element: HTMLElement) => void;
}

const shadowFor = (color: string, isActive: boolean, isClashing: boolean): string => {
  if (isActive) return `0 0 0 2px ${color}, 0 10px 24px rgba(0,0,0,0.4)`;
  if (isClashing) return '0 0 0 1px rgba(252,211,77,0.6), 0 0 0 4px rgba(251,191,36,0.08)';
  return '0 0 0 1px rgba(255,255,255,0.055), 0 14px 34px -28px rgba(0,0,0,0.8)';
};

const opacityFor = (isDimmed: boolean, isPast: boolean, cancelled: boolean, skipped: boolean): string => {
  if (isDimmed) return 'opacity-35';
  if (cancelled || skipped) return 'opacity-50';
  return isPast ? 'opacity-75' : '';
};

export const SessionBlock: React.FC<Props> = ({
  session,
  placement,
  box,
  reservedRight,
  code,
  isClashing,
  isActive,
  isDimmed,
  isPast,
  kindLabel,
  roomName,
  ariaLabel,
  badge,
  badgeLabel,
  sourceLabel,
  detail,
  onSelect,
}) => {
  const color = getModuleColorValueByIndex(session.colorIndex);
  const columnWidth = `(100% - ${reservedRight}px) / ${placement.cols}`;
  const showMeta = box.height >= META_HEIGHT;
  return (
    <button
      type="button"
      data-session-id={session.id}
      aria-label={ariaLabel}
      onClick={(event) => onSelect(session, event.currentTarget)}
      className={`absolute flex cursor-pointer flex-col justify-center overflow-hidden rounded-xl bg-container px-2.5 py-2 text-left transition-[opacity,box-shadow,transform] duration-150 ease-out hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lighterGreen active:scale-[0.96] ${opacityFor(isDimmed, isPast, session.cancelled, badge === 'skipping')}`}
      style={{
        top: box.top + 2,
        height: Math.max(box.height - 4, 18),
        left: `calc(${placement.col} * ${columnWidth} + 4px)`,
        width: `calc(${columnWidth} - 8px)`,
        boxShadow: shadowFor(color, isActive, isClashing),
      }}
    >
      <span
        aria-hidden="true"
        className="absolute top-2 bottom-2 left-2.5 w-1 rounded-full"
        style={{ backgroundColor: color }}
      />
      {badge && badgeLabel && (
        <span className="absolute top-1.5 right-1.5">
          <StatusChip tone={BADGE_TONE[badge]}>{badgeLabel}</StatusChip>
        </span>
      )}
      {!badge && sourceLabel && (
        <span className="absolute top-1.5 right-1.5">
          <StatusChip tone="neutral">{sourceLabel}</StatusChip>
        </span>
      )}
      <span className={`flex min-w-0 gap-2.5 pl-3.5 ${badge || sourceLabel ? 'pr-14' : ''}`}>
        <span className="min-w-0 flex-1">
          <span
            className={`line-clamp-2 block text-[13px] leading-[1.3] font-semibold text-offwhite ${session.cancelled ? 'line-through' : ''}`}
          >
            {session.courseName}
          </span>
          <span className="mt-1 flex min-w-0 items-center gap-x-1.5 font-mono text-[11px] whitespace-nowrap text-[#a3a3c4]">
            {code && (
              <>
                <span className="truncate">{code}</span>
                <span aria-hidden="true">·</span>
              </>
            )}
            <span className="font-semibold text-[#7ea0ff] tabular-nums">
              {formatClock(session.start)}–{formatClock(session.end)}
            </span>
          </span>
        </span>
        {isClashing && <WarningIcon className="mt-0.5 size-3 shrink-0 text-warn" />}
      </span>
      {showMeta && (
        <span className="mt-2 flex min-w-0 items-center gap-1.5 pl-3.5 text-[11.5px] text-[#a3a3c4]">
          <PinIcon className="size-3 shrink-0 text-lightGrey" />
          <span className="truncate">{[kindLabel, detail, roomName].filter(Boolean).join(' · ')}</span>
        </span>
      )}
    </button>
  );
};
