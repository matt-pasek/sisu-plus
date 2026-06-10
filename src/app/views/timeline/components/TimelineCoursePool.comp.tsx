import React from 'react';
import { useDroppable } from '@dnd-kit/react';
import { shapeIntersection } from '@dnd-kit/collision';
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
  moduleIds: string[];
  validationWarnings?: Map<string, TimelineValidationWarning[]>;
}

const FilterCheckbox: React.FC<{ checked: boolean; label: string; onChange: (value: boolean) => void }> = ({
  checked,
  label,
  onChange,
}) => (
  <label className="flex min-h-8 cursor-pointer items-center gap-2 rounded-lg border border-border bg-container2 px-3 text-xs font-semibold text-lightGrey transition-[border-color,color,background-color] duration-150 hover:border-border2 hover:text-offwhite">
    <input
      type="checkbox"
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
      className="size-3.5 accent-accent"
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
  moduleIds,
  validationWarnings = new Map(),
}) => {
  const { t } = useTranslationWithPrefix('views.timeline');
  const credits = unscheduledCourses.reduce((sum, course) => sum + (course.credits ?? 0), 0);
  const { ref, isDropTarget } = useDroppable({
    id: 'course-pool',
    accept: TIMELINE_COURSE_DRAG_TYPE,
    data: { kind: 'timeline-pool' },
    collisionDetector: shapeIntersection,
  });

  return (
    <aside
      ref={ref}
      className={`flex h-[calc(100dvh-96px)] w-67.5 shrink-0 flex-col border-r border-solid px-4 py-5 transition-[border-color,background-color,box-shadow] duration-200 ease-out ${
        isDropTarget
          ? 'border-accent bg-accent/10 shadow-[inset_-1px_0_0_rgba(65,150,72,0.35)]'
          : isDragging
            ? 'border-border2 bg-container shadow-[inset_-1px_0_0_rgba(255,255,255,0.04)]'
            : 'border-border bg-container'
      }`}
    >
      <div>
        <h2 className="text-xs font-bold tracking-[0.16em] text-lightGrey uppercase">{t('pool.title')}</h2>
        <div className="mt-3 rounded-lg border border-border2 bg-container2 px-3 py-2 text-sm text-darkishGrey">
          {t('pool.searchPlaceholder')}
        </div>
        <div className="mt-3 grid gap-2">
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

      <div className="mt-4 flex items-center justify-between text-xs text-lightGrey">
        <span>{t('pool.outsideTimeline')}</span>
        <span className="font-mono tabular-nums">{formatCredits(credits)}</span>
      </div>
      <p className="mt-1 text-xs leading-snug text-pretty text-darkishGrey">
        {t('pool.withoutVisiblePeriod', { count: unscheduledCourses.length })}
      </p>
      <div
        className={`mt-3 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-xs font-semibold text-accent transition-[opacity,scale,filter] duration-200 ease-[cubic-bezier(0.2,0,0,1)] ${
          isDropTarget ? 'blur-0 scale-100 opacity-100' : 'pointer-events-none scale-[0.25] opacity-0 blur-[4px]'
        }`}
      >
        {t('pool.unscheduleDrop')}
      </div>

      <div className="mt-5 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
        {unscheduledCourses.length > 0 ? (
          unscheduledCourses.map((course) => (
            <DraggableTimelineCourseCard
              key={getCourseKey(course)}
              course={course}
              color={getModuleColor(course.moduleId, moduleIds)}
              disabled={course.isPassed}
              dragPeriodCount={draftOriginalPeriodCounts.get(course.courseUnitId)}
              isDraft={draftCourseIds.has(course.courseUnitId)}
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
    </aside>
  );
};
