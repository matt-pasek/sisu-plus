import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { formatCredits } from '@/app/helpers/formatCredits';
import { getTermShortTitle } from '@/app/helpers/getSemesterTitle';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import type { LoadBar, LoadChart } from '@/app/views/timeline/types';

interface Props {
  chart: LoadChart;
  neededCredits: number | null;
  className?: string;
}

const EASE = [0.25, 1, 0.5, 1] as const;

const getBarTone = (bar: LoadBar, isFocused: boolean): string => {
  if (bar.isHeaviest) return 'bg-linear-to-b from-lighterGreen to-[#3da86b] shadow-[0_0_14px_rgba(82,201,137,0.35)]';
  if (bar.isPast) return isFocused ? 'bg-offwhite/35' : 'bg-offwhite/14';
  return isFocused ? 'bg-lighterGreen/60' : 'bg-lighterGreen/30';
};

export const HeroLoadChart: React.FC<Props> = ({ chart, neededCredits, className = '' }) => {
  const { t } = useTranslationWithPrefix('views.timeline');
  const shouldReduceMotion = useReducedMotion();
  const bars = chart.groups.flatMap((group) => group.bars);
  const heaviest = bars.find((bar) => bar.isHeaviest) ?? null;
  const [hovered, setHovered] = useState<LoadBar | null>(null);
  const focus = hovered ?? heaviest;

  if (bars.length === 0) return null;

  const describe = (bar: LoadBar) =>
    t('hero.loadPeriod', { period: bar.period.name, term: getTermShortTitle(bar.period) });

  return (
    <div className={`w-96 max-w-full flex-col gap-4 ${className}`} onPointerLeave={() => setHovered(null)}>
      <div className="flex items-baseline justify-between gap-6">
        <p className="shrink-0 font-mono text-[9px] font-semibold tracking-[0.12em] text-offwhite/60 uppercase">
          {t('hero.loadTitle')}
        </p>
        {focus && (
          <p className="min-w-0 truncate text-[11px] text-lightGrey/70">
            {describe(focus)}{' '}
            <span className="font-mono font-semibold text-offwhite tabular-nums">{formatCredits(focus.credits)}</span>
          </p>
        )}
      </div>

      <div aria-hidden="true" className="relative">
        {chart.neededRatio !== null && neededCredits !== null && (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-32">
            <div
              className="absolute inset-x-0 border-t border-dashed border-offwhite/25"
              style={{ bottom: `${chart.neededRatio * 100}%` }}
            >
              <span className="absolute right-0 bottom-1 font-mono text-[10px] text-lightGrey/70 tabular-nums">
                {t('hero.loadNeeded', { credits: formatCredits(neededCredits) })}
              </span>
            </div>
          </div>
        )}
        <div className="flex gap-3">
          {chart.groups.map((group) => (
            <div key={group.key} className="flex min-w-0 shrink flex-col gap-1">
              <div className="-mx-1.5 flex h-32 items-end gap-1.5 border-b border-offwhite/10 px-1.5">
                {group.bars.map((bar) => (
                  <div
                    key={bar.locator}
                    className="flex h-full w-[18px] min-w-1.5 shrink items-end"
                    onPointerEnter={() => setHovered(bar)}
                  >
                    <motion.div
                      className={`w-full origin-bottom rounded-t-[4px] transition-[background-color,box-shadow,opacity] duration-150 ${getBarTone(bar, focus?.locator === bar.locator)}`}
                      style={{ height: `${Math.max(bar.ratio * 100, bar.credits > 0 ? 3 : 0)}%` }}
                      initial={shouldReduceMotion ? false : { scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 0.45, delay: bars.indexOf(bar) * 0.03, ease: EASE }}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-2 flex gap-1.5">
                {group.bars.map((bar) => (
                  <span
                    key={bar.locator}
                    className={`w-[18px] min-w-1.5 shrink text-center font-mono text-[9px] tabular-nums ${
                      focus?.locator === bar.locator ? 'text-offwhite' : 'text-lightGrey/55'
                    }`}
                  >
                    {bar.tick}
                  </span>
                ))}
              </div>
              <span className="font-mono text-[9px] font-semibold tracking-[0.08em] whitespace-nowrap text-lightGrey/45 uppercase">
                {t(group.term.season === 'autumn' ? 'semester.autumnShort' : 'semester.springShort')}{' '}
                {String(group.term.year).slice(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <ul className="sr-only">
        {bars.map((bar) => (
          <li key={bar.locator}>
            {describe(bar)}: {formatCredits(bar.credits)}
          </li>
        ))}
      </ul>
    </div>
  );
};
