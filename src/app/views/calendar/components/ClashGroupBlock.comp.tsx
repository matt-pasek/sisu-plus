import React from 'react';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import type { Placement, Session, TimedBlock } from '@/app/schedule';
import { getModuleColorValueByIndex } from '@/app/theme/moduleColors';
import type { ClashGroupRow } from '../types';
import { formatClock } from '../util';
import { WarningIcon } from './icons';

const HEADER_HEIGHT = 24;
const HEADER_MIN_BLOCK = 76;
const DETAIL_MIN_ROW = 38;

interface Props {
  block: TimedBlock;
  rows: ClashGroupRow[];
  placement: Placement;
  box: { top: number; height: number };
  reservedRight: number;
  isClashing: boolean;
  activeSessionId: string | null;
  now: Date;
  onSelect: (session: Session, element: HTMLElement) => void;
}

const timeRange = (block: TimedBlock): string => `${formatClock(block.start)}–${formatClock(block.end)}`;

export const ClashGroupBlock: React.FC<Props> = ({
  block,
  rows,
  placement,
  box,
  reservedRight,
  isClashing,
  activeSessionId,
  now,
  onSelect,
}) => {
  const { t } = useTranslationWithPrefix('views.calendar');
  const columnWidth = `(100% - ${reservedRight}px) / ${placement.cols}`;
  const height = Math.max(box.height - 4, 18);
  const sharedTime = rows.every((row) => timeRange(row.session) === timeRange(block)) ? timeRange(block) : null;
  const showHeader = height >= HEADER_MIN_BLOCK;
  const showDetail = (height - (showHeader ? HEADER_HEIGHT : 0)) / rows.length >= DETAIL_MIN_ROW;
  const containsActive = rows.some((row) => row.session.id === activeSessionId);
  const isDimmed = activeSessionId != null && !containsActive;
  const isPast = block.end <= now;
  return (
    <div
      role="group"
      aria-label={t('clashGroup.aria', {
        count: rows.length,
        start: formatClock(block.start),
        end: formatClock(block.end),
      })}
      className={`@container absolute flex flex-col overflow-hidden rounded-xl bg-container transition-opacity duration-150 ease-out ${isDimmed ? 'opacity-35' : isPast ? 'opacity-75' : ''}`}
      style={{
        top: box.top + 2,
        height,
        left: `calc(${placement.col} * ${columnWidth} + 4px)`,
        width: `calc(${columnWidth} - 8px)`,
        boxShadow: isClashing
          ? '0 0 0 1px rgba(252,211,77,0.6), 0 0 0 4px rgba(251,191,36,0.08)'
          : '0 0 0 1px rgba(255,255,255,0.08)',
      }}
    >
      {showHeader && (
        <div className="flex h-6 shrink-0 items-center gap-1.5 px-2.5 pt-1">
          {isClashing && <WarningIcon className="size-3 shrink-0 text-warn" />}
          <span
            className={`truncate text-[11px] font-semibold @max-[8.5rem]:sr-only ${isClashing ? 'text-warn' : 'text-lightGrey'}`}
          >
            {isClashing ? t('clashGroup.clash') : t('clashGroup.overlap', { count: rows.length })}
          </span>
          {sharedTime && (
            <span className="ml-auto truncate font-mono text-[11px] font-semibold text-[#7ea0ff] tabular-nums">
              {sharedTime}
            </span>
          )}
        </div>
      )}
      <ul className="flex min-h-0 flex-1 flex-col">
        {rows.map((row) => {
          const isActive = row.session.id === activeSessionId;
          const isFaded = row.session.cancelled || row.status != null;
          const secondLine = row.status ?? (sharedTime ? row.detail : `${timeRange(row.session)} · ${row.detail}`);
          return (
            <li key={row.session.id} className="flex min-h-0 flex-1 border-t border-white/[0.06] first:border-t-0">
              <button
                type="button"
                data-session-id={row.session.id}
                aria-label={row.ariaLabel}
                onClick={(event) => onSelect(row.session, event.currentTarget)}
                className={`flex min-w-0 flex-1 cursor-pointer items-center gap-2 px-2.5 text-left transition-colors duration-150 hover:bg-offwhite/5 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-lighterGreen ${isActive ? 'bg-offwhite/8' : ''}`}
              >
                <span
                  aria-hidden="true"
                  className={`h-[calc(100%-12px)] max-h-8 min-h-2.5 w-1 shrink-0 rounded-full ${isFaded ? 'opacity-50' : ''}`}
                  style={{ backgroundColor: getModuleColorValueByIndex(row.session.colorIndex) }}
                />
                <span className={`min-w-0 flex-1 ${isFaded ? 'opacity-60' : ''}`}>
                  <span
                    className={`block truncate text-[12.5px] leading-tight font-semibold text-offwhite ${row.session.cancelled ? 'line-through' : ''}`}
                  >
                    {row.session.courseName}
                  </span>
                  {showDetail && (
                    <span className="mt-0.5 block truncate text-[11px] leading-tight text-[#a3a3c4]">{secondLine}</span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
