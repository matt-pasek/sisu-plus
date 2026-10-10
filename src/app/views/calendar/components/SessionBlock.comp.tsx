import React from 'react';
import type { Placement, Session } from '@/app/schedule';
import { getModuleColorValueByIndex } from '@/app/theme/moduleColors';
import { formatClock } from '../util';
import { WarningIcon } from './icons';

const COMPACT_HEIGHT = 40;

interface Props {
  session: Session;
  placement: Placement;
  box: { top: number; height: number };
  isClashing: boolean;
  isActive: boolean;
  isDimmed: boolean;
  kindLabel: string;
  roomName: string;
  ariaLabel: string;
  onSelect: (session: Session, element: HTMLElement) => void;
}

const shadowFor = (color: string, isActive: boolean, isClashing: boolean): string => {
  if (isActive) return `0 0 0 2px ${color}, 0 10px 24px rgba(0,0,0,0.4)`;
  if (isClashing) return '0 0 0 1px rgba(252,211,77,0.6), 0 0 0 4px rgba(251,191,36,0.08)';
  return `0 0 0 1px color-mix(in srgb, ${color} 16%, rgba(255,255,255,0.04)), 0 1px 2px rgba(0,0,0,0.25)`;
};

export const SessionBlock: React.FC<Props> = ({
  session,
  placement,
  box,
  isClashing,
  isActive,
  isDimmed,
  kindLabel,
  roomName,
  ariaLabel,
  onSelect,
}) => {
  const color = getModuleColorValueByIndex(session.colorIndex);
  const width = 100 / placement.cols;
  const compact = box.height < COMPACT_HEIGHT;
  return (
    <button
      type="button"
      data-session-id={session.id}
      aria-label={ariaLabel}
      onClick={(event) => onSelect(session, event.currentTarget)}
      className={`absolute cursor-pointer overflow-hidden rounded-lg py-1.5 pr-2 pl-[15px] text-left transition-[opacity,box-shadow,transform] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lighterGreen active:scale-[0.98] ${
        isDimmed ? 'opacity-35' : session.cancelled ? 'opacity-50' : ''
      }`}
      style={{
        top: box.top + 2,
        height: Math.max(box.height - 4, 18),
        left: `calc(${placement.col * width}% + 4px)`,
        width: `calc(${width}% - 8px)`,
        background: `color-mix(in srgb, ${color} 11%, var(--color-container))`,
        boxShadow: shadowFor(color, isActive, isClashing),
      }}
    >
      <span className="absolute top-1.5 bottom-1.5 left-1.5 w-1 rounded-full" style={{ backgroundColor: color }} />
      {isClashing && !compact && <WarningIcon className="absolute top-1.5 right-1.5 size-3 text-warn" />}
      <span
        className="block truncate font-mono text-[10px] font-medium tabular-nums"
        style={{ color: `color-mix(in srgb, ${color} 80%, white)` }}
      >
        {formatClock(session.start)}–{formatClock(session.end)}
      </span>
      {!compact && (
        <span
          className={`line-clamp-2 block text-xs leading-tight font-semibold text-offwhite ${session.cancelled ? 'line-through' : ''}`}
        >
          {session.courseName}
        </span>
      )}
      {!compact && (
        <span className="block truncate text-[11px] text-lightGrey">
          {kindLabel} · {roomName}
        </span>
      )}
    </button>
  );
};
