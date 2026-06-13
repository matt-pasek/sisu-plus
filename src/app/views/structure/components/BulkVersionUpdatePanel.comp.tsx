import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Button } from '@/app/components/ui/Button.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { useBulkVersionUpdates } from '@/app/views/structure/hooks/useBulkVersionUpdates';
import type { Plan } from '@/app/api/generated/OsuvaApi';
import { SectionData } from '@/app/views/structure/types';
import { formatCourseVersion } from '@/app/views/structure/components/CourseDetailsDialog.comp';

interface Props {
  plan: Plan;
  sections: SectionData[];
  onOpen: () => void;
}

export const BulkVersionUpdatePanel: React.FC<Props> = ({ plan, sections, onOpen }) => {
  const { t } = useTranslationWithPrefix('views.structure');
  const prefersReducedMotion = useReducedMotion();
  const { updates, isLoading } = useBulkVersionUpdates(plan, sections);
  const previewUpdates = updates.slice(0, 3);
  const moreCount = Math.max(updates.length - previewUpdates.length, 0);

  return (
    <motion.div
      className="relative overflow-hidden rounded-[14px] bg-container px-4.5 py-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.065)] transition-shadow duration-150 hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.095)] sm:px-5"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex min-w-0 items-start gap-3.5">
            <div className="grid size-10.5 shrink-0 place-items-center rounded-lg border border-accent/40 bg-accent/13 text-lighterGreen">
              <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
                <path
                  d="M12 3v9m0 0 3.5-3.5M12 12 8.5 8.5"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
                <path
                  d="M4.5 13a7.5 7.5 0 0 0 14.7 2"
                  opacity="0.85"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="2"
                />
              </svg>
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-[15px] leading-tight font-semibold text-offwhite">{t('bulkUpdate.panelTitle')}</h2>
                <motion.span
                  key={isLoading ? 'loading' : updates.length}
                  className="rounded-md bg-container2 px-2 py-1 font-mono text-[11px] font-semibold text-lighterGreen tabular-nums shadow-[inset_0_0_0_1px_rgba(82,201,137,0.22)]"
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                >
                  {isLoading ? '-' : updates.length}
                </motion.span>
              </div>
              <p className="mt-1.5 max-w-[54ch] text-[13px] leading-[1.45] text-lightGrey">
                {t('bulkUpdate.panelDescription')}
              </p>
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-wrap content-center gap-2 sm:justify-end lg:justify-start">
            {isLoading ? (
              <span className="rounded-lg bg-container2 px-3 py-2 font-mono text-[11px] text-lightGrey shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]">
                {t('bulkUpdate.checking')}
              </span>
            ) : (
              previewUpdates.map((update, index) => (
                <motion.span
                  key={update.course.courseUnitId}
                  className="inline-flex min-h-8 items-center gap-2 rounded-lg bg-container2 px-2.5 font-mono text-[11px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]"
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1], delay: index * 0.035 }}
                >
                  <span className="text-lightGrey">{update.course.code ?? update.course.courseUnitId}</span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="text-darkishGrey">{formatCourseVersion(update.current)}</span>
                    <span className="text-lightGrey/80">&rarr;</span>
                    <span className="font-semibold text-lighterGreen">{formatCourseVersion(update.latest)}</span>
                  </span>
                </motion.span>
              ))
            )}
            {!isLoading && moreCount > 0 && (
              <span className="self-center px-1 font-mono text-[11px] text-lightGrey">
                {t('bulkUpdate.moreCount', { count: moreCount })}
              </span>
            )}
          </div>
        </div>

        <Button
          className="w-full shrink-0 text-[13px] font-semibold whitespace-nowrap sm:w-auto"
          disabled={isLoading || updates.length === 0}
          icon={
            <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
              <path
                d="M12 19V5M5 12l7-7 7 7"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.2"
              />
            </svg>
          }
          onClick={onOpen}
          variant="accent"
        >
          {t('bulkUpdate.button')}
        </Button>
      </div>
    </motion.div>
  );
};
