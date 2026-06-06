import React from 'react';
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
  const status = getStatus(section.completedCredits, section.targetCredits);

  return (
    <button
      className="group flex min-h-20 w-full items-center gap-3 px-4 py-4 text-left transition-[background-color] duration-150 ease-out hover:bg-container2/55"
      type="button"
      aria-expanded={isOpen}
      onClick={onToggle}
    >
      <span className={`h-12 w-1 shrink-0 rounded-full ${color.accent}`} />
      <svg
        aria-hidden="true"
        className={`size-3.5 shrink-0 text-darkishGrey transition-transform duration-200 ease-out ${isOpen ? 'rotate-90' : ''}`}
        fill="none"
        viewBox="0 0 14 14"
      >
        <path d="M5 3l4 4-4 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      </svg>

      <span className="min-w-0 flex-1">
        <span className="mb-1 flex min-w-0 flex-wrap items-center gap-2">
          <span className="truncate text-lg font-semibold text-offwhite">{section.name}</span>
          <span className="rounded bg-container2 px-2 py-1 font-mono text-xs text-lightGrey">{section.moduleId}</span>
        </span>
        <span className="block h-1.5 max-w-65 overflow-hidden rounded-full bg-border2">
          <span
            className={`block h-full rounded-full transition-[width] duration-300 ease-out ${color.progress}`}
            style={{
              width: `${
                section.targetCredits > 0
                  ? Math.min(Math.max(section.completedCredits / section.targetCredits, 0), 1) * 100
                  : 0
              }%`,
            }}
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
        <span className="block text-xs text-lightGrey">{t('section.creditsPlanned')}</span>
        <span className="block font-mono text-sm tabular-nums">
          <span className="font-bold text-lighterGreen">{section.completedCredits}</span>
          <span className="text-darkishGrey"> / {section.targetCredits} cr</span>
        </span>
      </span>
    </button>
  );
};
