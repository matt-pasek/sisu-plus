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
  return '0 0 0 1px rgba(255,255,255,0.055), 0 10px 24px -20px rgba(0,0,0,0.8)';
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
      className={`absolute cursor-pointer overflow-hidden rounded-[10px] py-1.5 pr-2 pl-[17px] text-left transition-[opacity,box-shadow,transform] duration-150 ease-out hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lighterGreen active:scale-[0.96] ${
        isDimmed ? 'opacity-35' : session.cancelled ? 'opacity-50' : ''
      }`}
      style={{
        top: box.top + 2,
        height: Math.max(box.height - 4, 18),
        left: `calc(${placement.col * width}% + 4px)`,
        width: `calc(${width}% - 8px)`,
        background: `color-mix(in srgb, ${color} 5%, var(--color-container2))`,
        boxShadow: shadowFor(color, isActive, isClashing),
      }}
    >
      <span className="absolute top-2 bottom-2 left-[7px] w-1 rounded-full" style={{ backgroundColor: color }} />
      {isClashing && !compact && <WarningIcon className="absolute top-1.5 right-1.5 size-3 text-warn" />}
      <span className="block truncate font-mono text-[10px] font-medium text-lightGrey tabular-nums">
        {formatClock(session.start)}–{formatClock(session.end)}
      </span>
      {!compact && (
        <span
          className={`line-clamp-2 block text-[12.5px] leading-[1.25] font-semibold text-offwhite ${session.cancelled ? 'line-through' : ''}`}
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
