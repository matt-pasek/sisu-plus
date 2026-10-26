import React from 'react';
import { useDroppable } from '@dnd-kit/react';
import { shapeIntersection } from '@dnd-kit/collision';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Panel } from '@/app/components/ui/Panel.comp';
import { PanelEyebrow } from '@/app/components/ui/PanelEyebrow.comp';
import type { TimelineCourse } from '@/app/api/dataPoints/getTimelineCourses';
import { DraggableTimelineCourseCard } from '@/app/views/timeline/components/DraggableTimelineCourseCard.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { formatCredits } from '@/app/helpers/formatCredits';
import { TimelineValidationWarning } from '@/app/views/timeline/util/timelineValidation';
import { TIMELINE_COURSE_DRAG_TYPE } from '@/app/views/timeline/util/dndHandlers';
import { getCourseKey } from '@/app/views/timeline/util/getCourseKey';
import type { TimelineModule } from '@/app/views/timeline/util/sidebarLists';
import { getModuleColor } from '@/app/theme/moduleColors';
import { ModuleLegend } from '@/app/views/timeline/components/sidebar/ModuleLegend.comp';
import { PoolFilterToggle } from '@/app/views/timeline/components/sidebar/PoolFilterToggle.comp';

interface Props {
  draftCourseIds?: Set<string>;
  draftOriginalPeriodCounts?: Map<string, number>;
  hidePreviousPeriods?: boolean;
  isDragging?: boolean;
  modules?: TimelineModule[];
  onHidePreviousPeriodsChange?: (value: boolean) => void;
  onDismissValidationWarning?: (warningId: string) => void;
  onShowHiddenSummerPeriodsChange?: (value: boolean) => void;
  showHiddenSummerPeriods?: boolean;
  unscheduledCourses: TimelineCourse[];
  validationWarnings?: Map<string, TimelineValidationWarning[]>;
}

export const TimelineCoursePool: React.FC<Props> = ({
  draftCourseIds = new Set(),
  draftOriginalPeriodCounts = new Map(),
  hidePreviousPeriods = false,
  isDragging = false,
  modules = [],
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
  const { ref, isDropTarget } = useDroppable({
    id: 'course-pool',
    accept: TIMELINE_COURSE_DRAG_TYPE,
    data: { kind: 'timeline-pool' },
    collisionDetector: shapeIntersection,
  });

  return (
    <div
      ref={ref}
      className="flex min-h-64 flex-1 flex-col max-lg:max-h-full max-lg:min-h-0 max-lg:max-w-[360px] max-lg:min-w-[260px]"
    >
      <Panel
        className={`min-h-0 flex-1 transition-shadow duration-200 ease-out ${
          isDropTarget ? 'ring-1 ring-[rgba(65,150,72,0.7)] ring-inset' : ''
        }`}
        header={
          <PanelEyebrow>
            {t('pool.title')} · {unscheduledCourses.length}
          </PanelEyebrow>
        }
        footer={
          <div role="group" aria-label={t('pool.show')} className="flex flex-wrap items-center gap-1.5 py-1">
            <span aria-hidden="true" className="mr-0.5 font-semibold">
              {t('pool.show')}
            </span>
            <PoolFilterToggle
              pressed={!hidePreviousPeriods}
              label={t('pool.previous')}
              description={t('pool.showPrevious')}
              onChange={(pressed) => onHidePreviousPeriodsChange?.(!pressed)}
            />
            <PoolFilterToggle
              pressed={showHiddenSummerPeriods}
              label={t('pool.summer')}
              description={t('pool.showSummer')}
              onChange={(pressed) => onShowHiddenSummerPeriodsChange?.(pressed)}
            />
          </div>
        }
      >
        {modules.length > 0 && <ModuleLegend modules={modules} />}
        {unscheduledCourses.length > 0 && (
          <div className="shrink-0 border-b border-border px-4 py-2.5">
            <div className="flex items-baseline justify-between gap-3 text-xs text-lightGrey">
              <span>{t('pool.outsideTimeline')}</span>
              <span className="font-mono font-semibold text-offwhite tabular-nums">{formatCredits(credits)}</span>
            </div>
            <p className="mt-0.5 text-[11.5px] leading-snug text-pretty text-darkishGrey">
              {t('pool.withoutVisiblePeriod', { count: unscheduledCourses.length })}
            </p>
          </div>
        )}
        <div className="relative flex min-h-0 flex-1 flex-col">
          <AnimatePresence initial={false}>
            {isDropTarget && (
              <motion.div
                key="unschedule-drop-overlay"
                animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                className="pointer-events-none absolute inset-x-4 top-3 z-30 rounded-md border border-accent/60 bg-accent px-2 py-1.5 text-center text-xs font-semibold text-offwhite shadow-[0_8px_20px_rgba(0,0,0,0.28)]"
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -4, filter: 'blur(2px)' }}
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -4, filter: 'blur(2px)' }}
                transition={{ duration: shouldReduceMotion ? 0.01 : 0.18, ease: [0.25, 1, 0.5, 1] }}
              >
                {t('pool.unscheduleDrop')}
              </motion.div>
            )}
          </AnimatePresence>

          <div
            className={`flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto p-3 transition-colors duration-200 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border2 ${
              isDropTarget ? 'bg-accent/10' : isDragging ? 'bg-container2/40' : ''
            }`}
          >
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
                />
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-border p-4 text-sm text-lightGrey">
                {t('pool.empty')}
              </div>
            )}
          </div>
        </div>
      </Panel>
    </div>
  );
};
