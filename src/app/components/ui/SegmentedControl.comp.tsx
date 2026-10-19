import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import type { SegmentedOption } from './types';

const SEGMENT_EASE = [0.22, 1, 0.36, 1] as const;

const SIZES = {
  md: { track: 'rounded-xl p-[3px]', segment: 'min-h-10 rounded-[9px] px-[18px] text-sm' },
  sm: { track: 'rounded-[10px] p-0.5', segment: 'min-h-7 rounded-lg px-3 text-xs' },
} as const;

interface Props<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  layoutId: string;
  ariaLabel: string;
  size?: keyof typeof SIZES;
}

export const SegmentedControl = <T extends string>({
  options,
  value,
  onChange,
  layoutId,
  ariaLabel,
  size = 'md',
}: Props<T>): React.ReactElement => {
  const shouldReduceMotion = useReducedMotion();
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`inline-flex w-fit bg-container2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.055)] ${SIZES[size].track}`}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-keyshortcuts={option.keyShortcut}
            title={option.keyShortcut ? `${option.label} (${option.keyShortcut})` : undefined}
            disabled={option.disabled}
            onClick={() => onChange(option.value)}
            className={`relative inline-flex cursor-pointer items-center gap-2.5 overflow-hidden font-semibold transition-[color,transform] duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-lighterGreen active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 ${SIZES[size].segment} ${
              selected ? 'text-offwhite' : 'text-lightGrey hover:text-offwhite'
            }`}
          >
            {selected && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 bg-container shadow-[0_1px_4px_rgba(0,0,0,0.3)]"
                transition={{ duration: shouldReduceMotion ? 0 : 0.18, ease: SEGMENT_EASE }}
              />
            )}
            <span className="relative">{option.label}</span>
            {option.badge != null && <span className="relative">{option.badge}</span>}
          </button>
        );
      })}
    </div>
  );
};
