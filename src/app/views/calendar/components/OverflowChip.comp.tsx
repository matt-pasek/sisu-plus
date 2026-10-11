import React from 'react';

export const OVERFLOW_STRIP_WIDTH = 26;

interface Props {
  top: number;
  count: number;
  ariaLabel: string;
  onOpen: (element: HTMLElement) => void;
}

export const OverflowChip: React.FC<Props> = ({ top, count, ariaLabel, onOpen }) => (
  <button
    type="button"
    aria-label={ariaLabel}
    title={ariaLabel}
    onClick={(event) => onOpen(event.currentTarget)}
    className="absolute right-0.5 z-10 flex min-h-6 cursor-pointer items-center justify-center rounded-md bg-container2 font-mono text-[10px] font-semibold text-lightGrey shadow-[0_0_0_1px_rgba(255,255,255,0.06)] transition-colors duration-150 hover:text-offwhite focus-visible:outline-2 focus-visible:outline-lighterGreen"
    style={{ top: top + 2, width: OVERFLOW_STRIP_WIDTH - 4 }}
  >
    +{count}
  </button>
);
