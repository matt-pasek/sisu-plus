import React from 'react';
import type { Placement } from '@/app/schedule';
import { NoteIcon } from './icons';

type Variant = 'saved' | 'pending' | 'draft';

const VARIANT_CLASS: Record<Variant, string> = {
  saved:
    'cursor-pointer bg-[#132a20] shadow-[inset_0_0_0_1px_rgba(82,201,137,0.3)] transition-[opacity,transform] duration-150 ease-out hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lighterGreen active:scale-[0.96]',
  pending: 'bg-[#132a20] opacity-60 shadow-[inset_0_0_0_1px_rgba(82,201,137,0.2)]',
  draft: 'pointer-events-none bg-lighterGreen/[0.12] outline-1 outline-lighterGreen/80 outline-dashed',
};

interface Props {
  placement: Placement;
  box: { top: number; height: number };
  reservedRight: number;
  title: string;
  timeLabel: string;
  ariaLabel: string;
  variant: Variant;
  isPast: boolean;
  onSelect?: (element: HTMLElement) => void;
}

export const NoteBlock: React.FC<Props> = ({
  placement,
  box,
  reservedRight,
  title,
  timeLabel,
  ariaLabel,
  variant,
  isPast,
  onSelect,
}) => {
  const columnWidth = `(100% - ${reservedRight}px) / ${placement.cols}`;
  const style = {
    top: box.top + 2,
    height: Math.max(box.height - 4, 18),
    left: `calc(${placement.col} * ${columnWidth} + 4px)`,
    width: `calc(${columnWidth} - 8px)`,
  };
  const className = `absolute flex flex-col justify-center overflow-hidden rounded-xl px-2.5 py-1.5 text-left ${VARIANT_CLASS[variant]} ${isPast && variant === 'saved' ? 'opacity-75' : ''}`;
  const content = (
    <>
      <span className="flex min-w-0 items-center gap-1.5 text-[12.5px] leading-[1.3] font-semibold text-[#c9f2da]">
        <NoteIcon className="size-3 shrink-0 text-lighterGreen" />
        <span className="truncate">{title}</span>
      </span>
      <span className="mt-0.5 font-mono text-[11px] text-[#8fcfab] tabular-nums">{timeLabel}</span>
    </>
  );
  if (variant === 'draft') {
    return (
      <div aria-hidden="true" className={className} style={style}>
        {content}
      </div>
    );
  }
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={variant === 'pending'}
      onClick={(event) => onSelect?.(event.currentTarget)}
      className={className}
      style={style}
    >
      {content}
    </button>
  );
};
