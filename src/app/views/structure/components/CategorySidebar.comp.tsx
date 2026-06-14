import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { getModuleColorObject } from '@/app/theme/moduleColors';
import { SectionData } from '@/app/views/structure/types';

interface Props {
  sections: SectionData[];
  onSectionClick: (moduleId: string) => void;
}

export const CategorySidebar: React.FC<Props> = ({ sections, onSectionClick }) => {
  const { t } = useTranslationWithPrefix('views.structure');
  const prefersReducedMotion = useReducedMotion();

  return (
    <aside className="w-full">
      <div className="mb-1 font-mono text-[11px] font-semibold tracking-[0.14em] text-lightGrey uppercase">
        {t('sidebar.byCategory')}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {sections.map((section, sectionIndex) => {
          const color = getModuleColorObject(section.moduleId);
          const progress =
            section.targetCredits > 0
              ? Math.min(Math.max(section.completedCredits / section.targetCredits, 0), 1) * 100
              : 0;
          const remaining = Math.max(section.targetCredits - section.completedCredits, 0);

          return (
            <motion.button
              key={section.moduleId}
              className="sisu-structure__category group relative min-h-32 overflow-hidden rounded-[14px] bg-container px-4 py-4 text-left shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_14px_32px_-28px_rgba(0,0,0,0.85)] transition-[background-color] duration-150 ease-out outline-none hover:bg-container/95 focus-visible:shadow-[0_0_0_1px_rgba(82,201,137,0.5),0_18px_34px_-24px_rgba(0,0,0,0.9)]"
              type="button"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={prefersReducedMotion ? undefined : { y: -2 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1], delay: Math.min(sectionIndex, 8) * 0.03 }}
              onClick={() => onSectionClick(section.moduleId)}
            >
              <span
                className="absolute top-4 bottom-4 left-4 w-1 rounded-full"
                style={{ backgroundColor: color.value }}
              />
              <span className="flex h-full min-w-0 flex-col justify-between pl-4">
                <span className="min-h-10 text-[15px] leading-[1.2] font-semibold text-offwhite">{section.name}</span>
                <span
                  className="mt-3 font-mono text-[30px] leading-none font-bold tabular-nums"
                  style={{ color: color.value }}
                >
                  {section.completedCredits}
                  <span className="text-[0.5em] font-semibold text-lightGrey"> / {section.targetCredits}</span>
                </span>
                <div>
                  <span className="mt-3 block h-1.5 overflow-hidden rounded-full bg-border2">
                    <span
                      className="sisu-widget-bar-x block h-full rounded-full"
                      style={{ width: `${progress}%`, backgroundColor: color.value }}
                    />
                  </span>
                  <span className="mt-3 flex items-center justify-between gap-3 text-[12px] text-lightGrey">
                    <span>{t('sidebar.creditsLeft', { count: remaining })}</span>
                    <span
                      className="sisu-structure__category-arrow inline-flex items-center gap-1 font-mono"
                      style={{ color: color.value }}
                    >
                      {t('sidebar.viewAction')}
                      <svg aria-hidden="true" className="size-3" fill="none" viewBox="0 0 11 11">
                        <path
                          d="M3 2l4 3.5L3 9"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.7"
                        />
                      </svg>
                    </span>
                  </span>
                </div>
              </span>
            </motion.button>
          );
        })}
      </div>
    </aside>
  );
};
