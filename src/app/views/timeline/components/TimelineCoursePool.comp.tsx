import React from 'react';
import { useDroppable } from '@dnd-kit/react';
import { shapeIntersection } from '@dnd-kit/collision';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { TimelineCourse } from '@/app/api/dataPoints/getTimelineCourses';
import { DraggableTimelineCourseCard } from '@/app/views/timeline/components/DraggableTimelineCourseCard.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { formatCredits } from '@/app/helpers/formatCredits';
import { TimelineValidationWarning } from '@/app/views/timeline/util/timelineValidation';
import { TIMELINE_COURSE_DRAG_TYPE } from '@/app/views/timeline/util/dndHandlers';
import { getCourseKey } from '@/app/views/timeline/util/getCourseKey';
import { getModuleColor } from '@/app/theme/moduleColors';

interface Props {
  draftCourseIds?: Set<string>;
  draftOriginalPeriodCounts?: Map<string, number>;
  hidePreviousPeriods?: boolean;
  isDragging?: boolean;
  onHidePreviousPeriodsChange?: (value: boolean) => void;
  onDismissValidationWarning?: (warningId: string) => void;
  onShowHiddenSummerPeriodsChange?: (value: boolean) => void;
  showHiddenSummerPeriods?: boolean;
  unscheduledCourses: TimelineCourse[];
  validationWarnings?: Map<string, TimelineValidationWarning[]>;
}

const FilterCheckbox: React.FC<{ checked: boolean; label: string; onChange: (value: boolean) => void }> = ({
  checked,
  label,
  onChange,
}) => (
  <label className="flex min-h-7 cursor-pointer items-center gap-2 text-xs font-semibold text-lightGrey transition-colors duration-150 hover:text-offwhite">
    <input
      type="checkbox"
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
      className="size-4 rounded accent-accent"
    />
    {label}
  </label>
);

export const TimelineCoursePool: React.FC<Props> = ({
  draftCourseIds = new Set(),
  draftOriginalPeriodCounts = new Map(),
  hidePreviousPeriods = false,
  isDragging = false,
  onHidePreviousPeriodsChange,
  onDismissValidationWarning,
  onShowHiddenSummerPeriodsChange,
  showHiddenSummerPeriods = false,
  unscheduledCourses,
  validationWarnings = new Map(),
}) => {
  const { t } = useTranslationWithPrefix('views.timeline');
  const shouldReduceMotion = useReducedMotion();
  const credits = unscheduledCourses.reduce((sum, course) => sum + (course.credits ?? 0), 0);
  const validationMessages = Array.from(validationWarnings.values()).flatMap((warnings: TimelineValidationWarning[]) =>
    warnings.map((warning: TimelineValidationWarning) => warning.message),
  );
  const { ref, isDropTarget } = useDroppable({
    id: 'course-pool',
    accept: TIMELINE_COURSE_DRAG_TYPE,
    data: { kind: 'timeline-pool' },
    collisionDetector: shapeIntersection,
  });

  return (
    <aside
      ref={ref}
      className={`flex h-[calc(100dvh-96px)] w-80 shrink-0 flex-col gap-3 overflow-hidden px-4 py-5 transition-[border-color,background-color,box-shadow] duration-200 ease-out`}
    >
      <div className="shrink-0 rounded-2xl border border-border bg-container px-4 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.025)]">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xs font-bold tracking-[0.18em] text-lightGrey uppercase">{t('pool.title')}</h2>
          <span className="font-mono text-xs font-semibold text-lightGrey tabular-nums">
            {unscheduledCourses.length}
          </span>
        </div>
        {/*<div className="mt-4 flex min-h-10 items-center gap-2 rounded-xl border border-border2 bg-background px-3 text-sm text-darkishGrey">*/}
        {/*  <svg aria-hidden="true" className="size-4 shrink-0 text-lightGrey/75" fill="none" viewBox="0 0 24 24">*/}
        {/*    <path*/}
        {/*      d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"*/}
        {/*      stroke="currentColor"*/}
        {/*      strokeLinecap="round"*/}
        {/*      strokeLinejoin="round"*/}
        {/*      strokeWidth="2"*/}
        {/*    />*/}
        {/*  </svg>*/}
        {/*  {t('pool.searchPlaceholder')}*/}
        {/*</div>*/}
        <div className="mt-3 grid gap-1.5">
          <FilterCheckbox
            checked={hidePreviousPeriods}
            label={t('pool.hidePrevious')}
            onChange={(value) => onHidePreviousPeriodsChange?.(value)}
          />
          <FilterCheckbox
            checked={showHiddenSummerPeriods}
            label={t('pool.showSummer')}
            onChange={(value) => onShowHiddenSummerPeriodsChange?.(value)}
          />
        </div>
      </div>

      <section
        className={`relative flex min-h-0 flex-1 flex-col gap-2 overflow-hidden rounded-2xl border px-4 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.025)] ${
          isDropTarget
            ? 'border-accent bg-accent/10 shadow-[inset_-1px_0_0_rgba(65,150,72,0.35)]'
            : isDragging
              ? 'border-border2 bg-container shadow-[inset_-1px_0_0_rgba(255,255,255,0.04)]'
              : 'border-border bg-container'
        }`}
      >
        <h3 className="shrink-0 text-xs font-bold tracking-[0.18em] text-lightGrey uppercase">
          {t('pool.unscheduled')}
        </h3>
        <AnimatePresence initial={false}>
          {isDropTarget && (
            <motion.div
              key="unschedule-drop-overlay"
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
              className="pointer-events-none absolute inset-x-4 top-12 z-30 rounded-md border border-accent/60 bg-accent px-2 py-1.5 text-center text-xs font-semibold text-offwhite shadow-[0_8px_20px_rgba(0,0,0,0.28)]"
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -4, filter: 'blur(2px)' }}
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -4, filter: 'blur(2px)' }}
              transition={{ duration: shouldReduceMotion ? 0.01 : 0.18, ease: [0.22, 1, 0.36, 1] }}
            >
              {t('pool.unscheduleDrop')}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto pr-1 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border2">
          {unscheduledCourses.length > 0 ? (
            unscheduledCourses.map((course) => (
              <DraggableTimelineCourseCard
                key={getCourseKey(course)}
                course={course}
                color={getModuleColor(course.moduleId)}
                disabled={course.isPassed}
                dragPeriodCount={draftOriginalPeriodCounts.get(course.courseUnitId)}
                isDraft={draftCourseIds.has(course.courseUnitId)}
                className="shrink-0"
                onDismissValidationWarning={onDismissValidationWarning}
                validationWarnings={validationWarnings.get(course.courseUnitId)}
                compact
              />
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-border p-4 text-sm text-lightGrey">
              {t('pool.empty')}
            </div>
          )}
        </div>

        <div className="shrink-0">
          <div className="flex items-center justify-between text-xs text-lightGrey">
            <span>{t('pool.outsideTimeline')}</span>
            <span className="font-mono font-semibold text-offwhite tabular-nums">{formatCredits(credits)}</span>
          </div>
          <p className="mt-1 text-xs leading-snug text-pretty text-darkishGrey">
            {t('pool.withoutVisiblePeriod', { count: unscheduledCourses.length })}
          </p>
        </div>
      </section>

      <AnimatePresence initial={false}>
        {validationMessages.length > 0 && (
          <motion.section
            key="pool-validation-messages"
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, filter: 'blur(0px)' }}
            className="shrink-0 rounded-2xl border border-amber-300/35 bg-amber-400/10 px-4 py-4 text-amber-100 shadow-[0_0_0_1px_rgba(251,191,36,0.08)]"
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, filter: 'blur(2px)' }}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, filter: 'blur(2px)' }}
            transition={{ duration: shouldReduceMotion ? 0.01 : 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-200">
              <svg aria-hidden="true" className="size-4 shrink-0" fill="none" viewBox="0 0 24 24">
                <path
                  d="M12 8v5m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
              {t(validationMessages.length === 1 ? 'pool.schedulingIssue' : 'pool.schedulingIssues', {
                count: validationMessages.length,
              })}
            </h3>
            <p className="mt-3 line-clamp-4 text-xs leading-relaxed text-pretty text-lightGrey">
              {validationMessages.slice(0, 2).join(' ')}
            </p>
          </motion.section>
        )}
      </AnimatePresence>
    </aside>
  );
};
