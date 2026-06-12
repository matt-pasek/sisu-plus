import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
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
      className="relative overflow-hidden rounded-[14px] bg-[radial-gradient(130%_200%_at_0%_0%,rgba(82,201,137,0.12),transparent_52%),var(--color-container)] px-5 py-5 shadow-[0_0_0_1px_rgba(82,201,137,0.20),0_20px_48px_-28px_rgba(0,0,0,0.85)]"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="absolute inset-y-0 left-0 w-[3px] bg-[linear-gradient(180deg,var(--color-lighterGreen),var(--color-accent))]" />
      <div className="sisu-structure__update-sheen pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_38%,rgba(82,201,137,0.07)_50%,transparent_62%)]" />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center">
        <motion.div
          className="sisu-structure__update-icon relative grid size-[54px] shrink-0 place-items-center rounded-2xl bg-[linear-gradient(155deg,var(--color-lighterGreen),var(--color-accent))] text-background shadow-[0_10px_24px_-7px_rgba(65,150,72,0.7)]"
          animate={prefersReducedMotion || isLoading || updates.length === 0 ? undefined : { scale: [1, 1.035, 1] }}
          transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1], repeat: Infinity, repeatDelay: 2.8 }}
        >
          <svg aria-hidden="true" className="size-6.5" fill="none" viewBox="0 0 24 24">
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
        </motion.div>

        <div className="min-w-0 shrink-0">
          <div className="flex items-baseline gap-2">
            <motion.b
              key={isLoading ? 'loading' : updates.length}
              className="font-mono text-[30px] leading-none font-bold text-offwhite tabular-nums"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            >
              {isLoading ? '-' : updates.length}
            </motion.b>
            <span className="text-[15px] font-semibold text-offwhite">{t('bulkUpdate.panelTitle').toLowerCase()}</span>
          </div>
          <p className="mt-2 max-w-[40ch] text-[12.5px] leading-[1.45] text-lightGrey">
            {t('bulkUpdate.panelDescription')}
          </p>
        </div>

        <div className="flex min-w-0 flex-1 flex-wrap content-center gap-2">
          {isLoading ? (
            <span className="rounded-[11px] bg-container2 px-3 py-2 font-mono text-[11px] text-lightGrey shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]">
              {t('bulkUpdate.checking')}
            </span>
          ) : (
            previewUpdates.map((update, index) => (
              <motion.span
                key={update.course.courseUnitId}
                className="inline-flex items-center gap-2.5 rounded-[11px] bg-container2 px-3 py-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1], delay: index * 0.035 }}
              >
                <span className="font-mono text-[11px] text-lightGrey">
                  {update.course.code ?? update.course.courseUnitId}
                </span>
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px]">
                  <span className="text-darkishGrey">{formatCourseVersion(update.current)}</span>
                  <span className="text-lighterGreen">&rarr;</span>
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

        <div className="flex shrink-0 flex-col items-stretch gap-2">
          <motion.button
            type="button"
            disabled={isLoading || updates.length === 0}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-[10px] bg-[linear-gradient(155deg,var(--color-lighterGreen),var(--color-accent))] px-5 text-[13px] font-bold whitespace-nowrap text-background shadow-[0_10px_22px_-8px_rgba(65,150,72,0.65)] transition-[transform,box-shadow,opacity] duration-150 hover:shadow-[0_14px_28px_-8px_rgba(65,150,72,0.8)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-45"
            whileHover={prefersReducedMotion || isLoading || updates.length === 0 ? undefined : { y: -1 }}
            whileTap={prefersReducedMotion || isLoading || updates.length === 0 ? undefined : { scale: 0.97 }}
            onClick={onOpen}
          >
            <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
              <path
                d="M12 19V5M5 12l7-7 7 7"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.2"
              />
            </svg>
            {t('bulkUpdate.button')}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
