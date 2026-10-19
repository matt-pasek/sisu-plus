import React from 'react';
import type { Placement, Session } from '@/app/schedule';
import { getModuleColorValueByIndex } from '@/app/theme/moduleColors';
import { formatClock } from '../util';

const CLASH_HATCH = 'repeating-linear-gradient(135deg, rgba(240,168,77,0.16) 0 6px, transparent 6px 12px)';
const BASE_CLASS =
  'absolute flex flex-col justify-center overflow-hidden rounded-xl border border-dashed px-2.5 py-1.5 text-left';

interface Props {
  session: Session;
  placement: Placement;
  box: { top: number; height: number };
  variant: 'alternative' | 'preview';
  isClashing: boolean;
  ariaLabel: string;
  onSelect?: (session: Session, element: HTMLElement) => void;
}

export const AlternativeBlock: React.FC<Props> = ({
  session,
  placement,
  box,
  variant,
  isClashing,
  ariaLabel,
  onSelect,
}) => {
  const color = getModuleColorValueByIndex(session.colorIndex);
  const columnWidth = `100% / ${placement.cols}`;
  const style = {
    top: box.top + 2,
    height: Math.max(box.height - 4, 18),
    left: `calc(${placement.col} * ${columnWidth} + 4px)`,
    width: `calc(${columnWidth} - 8px)`,
    borderColor: isClashing ? 'rgba(252,211,77,0.7)' : color,
    backgroundImage: isClashing ? CLASH_HATCH : undefined,
  };
  const content = (
    <>
      <span className="line-clamp-2 block text-[12px] leading-[1.3] font-semibold text-offwhite">
        {session.courseName}
      </span>
      <span className="mt-0.5 block truncate font-mono text-[10.5px] text-[#a3a3c4] tabular-nums">
        {formatClock(session.start)}–{formatClock(session.end)}
        {session.groupName ? ` · ${session.groupName}` : ''}
      </span>
    </>
  );

  if (variant === 'preview' || !onSelect) {
    return (
      <div aria-hidden="true" className={`${BASE_CLASS} pointer-events-none z-10 bg-container/70`} style={style}>
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      data-session-id={session.id}
      aria-label={ariaLabel}
      onClick={(event) => onSelect(session, event.currentTarget)}
      className={`${BASE_CLASS} z-0 cursor-pointer opacity-55 transition-opacity duration-150 hover:z-30 hover:bg-container hover:opacity-100 focus-visible:z-30 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lighterGreen`}
      style={style}
    >
      {content}
    </button>
  );
};
