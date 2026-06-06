import React from 'react';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import type { ModuleColor } from '@/app/theme/moduleColors';
import { SectionData } from '@/app/views/structure/types';

interface Props {
  sections: SectionData[];
  colors: ModuleColor[];
  onSectionClick: (moduleId: string) => void;
}

export const CategorySidebar: React.FC<Props> = ({ sections, colors, onSectionClick }) => {
  const { t } = useTranslationWithPrefix('views.structure');

  return (
    <aside className="w-full shrink-0 rounded-[10px] bg-container px-5 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.07),0_18px_50px_rgba(0,0,0,0.18)] lg:w-87.5">
      <div className="mb-4 text-xs font-bold tracking-[0.14em] text-lightGrey uppercase">{t('sidebar.byCategory')}</div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
        {sections.map((section, index) => {
          const color = colors[index % colors.length];
          return (
            <button
              key={section.moduleId}
              className="group flex min-h-14 items-center gap-3 rounded-md px-1.5 py-1.5 text-left transition-[background-color,scale] duration-150 ease-out hover:bg-container2/70 active:scale-[0.96]"
              type="button"
              onClick={() => onSectionClick(section.moduleId)}
            >
              <span className={`h-8 w-1 shrink-0 rounded-full ${color.accent}`} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-offwhite">{section.name}</span>
                <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-border2">
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
              <span
                className={`min-w-12 shrink-0 text-right font-mono text-sm font-semibold tabular-nums ${color.text}`}
              >
                {section.completedCredits}
                <span className="text-xs font-normal text-lightGrey">/{section.targetCredits}</span>
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};
