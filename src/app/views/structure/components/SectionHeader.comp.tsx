import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import type { ModuleColor } from '@/app/theme/moduleColors';
import { SectionData } from '@/app/views/structure/types';

interface Props {
  section: SectionData;
  color: ModuleColor;
  isOpen: boolean;
  onToggle: () => void;
}

function getStatus(completed: number, target: number): 'complete' | 'progress' | 'missing' {
  if (target > 0 && completed >= target) return 'complete';
  if (completed > 0) return 'progress';
  return 'missing';
}

export const SectionHeader: React.FC<Props> = ({ section, color, isOpen, onToggle }) => {
  const { t } = useTranslationWithPrefix('views.structure');
  const prefersReducedMotion = useReducedMotion();
  const status = getStatus(section.completedCredits, section.targetCredits);
  const progress =
    section.targetCredits > 0 ? Math.min(Math.max(section.completedCredits / section.targetCredits, 0), 1) * 100 : 0;

  return (
    <button
      className="group flex min-h-19 w-full items-center gap-4 bg-transparent px-5 py-4.25 text-left transition-[background-color] duration-150 ease-out hover:bg-white/[0.02]"
      type="button"
      aria-expanded={isOpen}
      onClick={onToggle}
    >
      <span className="min-h-11 w-1 shrink-0 self-stretch rounded-full" style={{ backgroundColor: color.value }} />
      <motion.svg
        aria-hidden="true"
        className="size-3.5 shrink-0 text-darkishGrey"
        fill="none"
        viewBox="0 0 14 14"
        animate={{ rotate: isOpen ? 90 : 0 }}
        transition={{ duration: prefersReducedMotion ? 0.01 : 0.18, ease: [0.22, 1, 0.36, 1] }}
      >
        <path d="M5 3l4 4-4 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      </motion.svg>

      <span className="min-w-0 flex-1">
        <span className="mb-2 flex min-w-0 flex-wrap items-center gap-2.5">
          <span className="truncate text-lg font-semibold text-offwhite">{section.name}</span>
        </span>
        <span className="block h-1.5 max-w-90 overflow-hidden rounded-full bg-border2">
          <span
            className="sisu-widget-bar-x block h-full rounded-full transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%`, backgroundColor: color.value }}
          />
        </span>
      </span>

      {status !== 'missing' && (
        <span
          className={`hidden shrink-0 rounded px-3 py-1.5 text-xs font-bold sm:inline-flex ${
            status === 'complete' ? 'bg-lighterGreen/10 text-lighterGreen' : 'bg-warn/10 text-warn'
          }`}
        >
          {status === 'complete' ? t('section.statusComplete') : t('section.statusInProgress')}
        </span>
      )}

      <span className="min-w-24 shrink-0 text-right">
        <span className="block text-[11px] text-lightGrey">{t('section.creditsPlanned')}</span>
        <span className="block font-mono text-sm tabular-nums">
          <span className="font-bold text-lighterGreen">{section.completedCredits}</span>
          <span className="text-darkishGrey"> / {section.targetCredits} cr</span>
        </span>
      </span>
    </button>
  );
};
