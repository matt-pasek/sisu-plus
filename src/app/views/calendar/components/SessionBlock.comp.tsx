import React from 'react';
import type { Placement, Session } from '@/app/schedule';
import { getModuleColorValueByIndex } from '@/app/theme/moduleColors';
import { formatClock } from '../util';
import { WarningIcon } from './icons';

const META_HEIGHT = 56;

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
  onSelect: (session: Session, element: HTMLElement) => void;
}

const shadowFor = (color: string, isActive: boolean, isClashing: boolean): string => {
  if (isActive) return `0 0 0 2px ${color}, 0 10px 24px rgba(0,0,0,0.4)`;
  if (isClashing) return '0 0 0 1px rgba(252,211,77,0.6), 0 0 0 4px rgba(251,191,36,0.08)';
  return `0 0 0 1px color-mix(in srgb, ${color} 16%, rgba(255,255,255,0.04)), 0 1px 2px rgba(0,0,0,0.25)`;
};

const opacityFor = (isDimmed: boolean, isPast: boolean, cancelled: boolean): string => {
  if (isDimmed) return 'opacity-35';
  if (cancelled) return 'opacity-50';
  return isPast ? 'opacity-65' : '';
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
      className={`absolute cursor-pointer overflow-hidden rounded-lg py-1.5 pr-2 pl-[15px] text-left transition-[opacity,box-shadow,transform] duration-150 ease-out hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lighterGreen active:scale-[0.96] ${opacityFor(isDimmed, isPast, session.cancelled)}`}
      style={{
        top: box.top + 2,
        height: Math.max(box.height - 4, 18),
        left: `calc(${placement.col} * ${columnWidth} + 4px)`,
        width: `calc(${columnWidth} - 8px)`,
        background: `color-mix(in srgb, ${color} 11%, var(--color-container))`,
        boxShadow: shadowFor(color, isActive, isClashing),
      }}
    >
      <span
        aria-hidden="true"
        className="absolute top-1.5 bottom-1.5 left-1.5 w-1 rounded-full"
        style={{ backgroundColor: color }}
      />
      {isClashing && <WarningIcon className="absolute top-1.5 right-1.5 size-3 text-warn" />}
      <span
        className={`line-clamp-2 block pr-3 text-[12.5px] leading-[1.25] font-semibold text-offwhite ${session.cancelled ? 'line-through' : ''}`}
      >
        {session.courseName}
      </span>
      <span className="mt-px block truncate font-mono text-[10.5px] text-lightGrey">
        {code && <>{code} · </>}
        <span className="font-medium tabular-nums" style={{ color: `color-mix(in srgb, ${color} 80%, white)` }}>
          {formatClock(session.start)}–{formatClock(session.end)}
        </span>
      </span>
      {showMeta && (
        <span className="mt-0.5 block truncate text-[11px] text-lightGrey">
          {kindLabel} · {roomName}
        </span>
      )}
    </button>
  );
};
