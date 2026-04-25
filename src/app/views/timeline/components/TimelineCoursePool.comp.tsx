import React from 'react';
import { useDroppable } from '@dnd-kit/react';
import type { TimelineCourse } from '@/app/api/dataPoints/getTimelineCourses';
import { DraggableTimelineCourseCard } from '@/app/views/timeline/components/TimelineCourseCard.comp';
import { TIMELINE_COURSE_DRAG_TYPE } from '@/app/views/timeline/components/timelineDnd';
import { formatCredits, getCourseKey, getModuleColor } from '@/app/views/timeline/components/timelineUtils';
import type { TimelineValidationWarning } from '@/app/views/timeline/components/timelineValidation';

interface Props {
  draftCourseIds?: Set<string>;
  isDragging?: boolean;
  onDismissValidationWarning?: (warningId: string) => void;
  unscheduledCourses: TimelineCourse[];
  moduleIds: string[];
  validationWarnings?: Map<string, TimelineValidationWarning[]>;
}

export const TimelineCoursePool: React.FC<Props> = ({
  draftCourseIds = new Set(),
  isDragging = false,
  onDismissValidationWarning,
  unscheduledCourses,
  moduleIds,
  validationWarnings = new Map(),
}) => {
  const credits = unscheduledCourses.reduce((sum, course) => sum + (course.credits ?? 0), 0);
  const { ref, isDropTarget } = useDroppable({
    id: 'course-pool',
    accept: TIMELINE_COURSE_DRAG_TYPE,
    data: { kind: 'timeline-pool' },
  });

  return (
    <aside
      ref={ref}
      className={`flex h-[calc(100dvh-96px)] w-[270px] shrink-0 flex-col border-r border-solid px-4 py-5 transition-[border-color,background-color,box-shadow] duration-200 ease-out ${
        isDropTarget
          ? 'border-accent bg-accent/10 shadow-[inset_-1px_0_0_rgba(65,150,72,0.35)]'
          : isDragging
            ? 'border-border2 bg-container shadow-[inset_-1px_0_0_rgba(255,255,255,0.04)]'
            : 'border-border bg-container'
      }`}
    >
      <div>
        <h2 className="text-xs font-bold tracking-[0.16em] text-lightGrey uppercase">Course Pool</h2>
        <div className="mt-3 rounded-lg border border-border2 bg-container2 px-3 py-2 text-sm text-darkishGrey">
          Search...
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-lightGrey">
        <span>Outside shown timeline</span>
        <span className="font-mono tabular-nums">{formatCredits(credits)}</span>
      </div>
      <p className="mt-1 text-xs leading-snug text-pretty text-darkishGrey">
        {unscheduledCourses.length} course{unscheduledCourses.length === 1 ? '' : 's'} without a visible timing period.
      </p>
      <div
        className={`mt-3 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-xs font-semibold text-accent transition-[opacity,scale,filter] duration-200 ease-[cubic-bezier(0.2,0,0,1)] ${
          isDropTarget ? 'blur-0 scale-100 opacity-100' : 'pointer-events-none scale-[0.25] opacity-0 blur-[4px]'
        }`}
      >
        Drop to unschedule
      </div>

      <div className="mt-5 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
        {unscheduledCourses.length > 0 ? (
          unscheduledCourses.map((course) => (
            <DraggableTimelineCourseCard
              key={getCourseKey(course)}
              course={course}
              color={getModuleColor(course.moduleId, moduleIds)}
              disabled={course.isPassed}
              isDraft={draftCourseIds.has(course.courseUnitId)}
              onDismissValidationWarning={onDismissValidationWarning}
              validationWarnings={validationWarnings.get(course.courseUnitId)}
              compact
            />
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-border p-4 text-sm text-lightGrey">
            Every planned course has a study period.
          </div>
        )}
      </div>
    </aside>
  );
};
