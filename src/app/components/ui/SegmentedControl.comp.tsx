import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import type { SegmentedOption } from './types';

const SEGMENT_EASE = [0.22, 1, 0.36, 1] as const;

interface Props<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  layoutId: string;
  ariaLabel: string;
}

export const SegmentedControl = <T extends string>({
  options,
  value,
  onChange,
  layoutId,
  ariaLabel,
}: Props<T>): React.ReactElement => {
  const shouldReduceMotion = useReducedMotion();
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="inline-flex w-fit rounded-xl bg-container2 p-[3px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.055)]"
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={selected}
            disabled={option.disabled}
            onClick={() => onChange(option.value)}
            className={`relative inline-flex min-h-10 cursor-pointer items-center gap-2.5 overflow-hidden rounded-[9px] px-[18px] text-sm font-semibold transition-[color,transform] duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 ${
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
