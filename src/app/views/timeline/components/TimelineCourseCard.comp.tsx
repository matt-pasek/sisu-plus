import React from 'react';
import { useDraggable } from '@dnd-kit/react';
import { motion, useAnimationControls, type LegacyAnimationControls } from 'motion/react';
import type { TimelineCourse } from '@/app/api/dataPoints/getTimelineCourses';
import { getCourseDragData, TIMELINE_COURSE_DRAG_TYPE } from '@/app/views/timeline/components/timelineDnd';
import { formatCredits, getStatusClass, getStatusLabel } from '@/app/views/timeline/components/timelineUtils';
import type { TimelineValidationWarning } from '@/app/views/timeline/components/timelineValidation';

interface Props {
  course: TimelineCourse;
  color: string;
  compact?: boolean;
  className?: string;
  dragBlockedControls?: LegacyAnimationControls;
  isDraft?: boolean;
  onDismissValidationWarning?: (warningId: string) => void;
  onPointerDown?: React.PointerEventHandler<HTMLDivElement>;
  style?: React.CSSProperties;
  validationWarnings?: TimelineValidationWarning[];
}

export const TimelineCourseCard = React.forwardRef<HTMLDivElement, Props>(
  (
    {
      course,
      color,
      compact = false,
      className = '',
      dragBlockedControls,
      isDraft = false,
      onDismissValidationWarning,
      onPointerDown,
      style,
      validationWarnings = [],
    },
    ref,
  ) => (
    <motion.div
      layout
      animate={dragBlockedControls}
      initial={false}
      onPointerDown={onPointerDown}
      ref={ref}
      transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
      title={`${course.courseName ?? 'Unnamed course'} · ${formatCredits(course.credits)} · ${getStatusLabel(course)}${
        validationWarnings.length > 0 ? ` · ${validationWarnings.map((warning) => warning.message).join(' ')}` : ''
      }`}
      className={`group relative flex flex-col overflow-hidden rounded-lg border px-3 py-2 transition-[border-color,background-color,box-shadow,opacity,transform] duration-200 ease-out ${
        validationWarnings.length > 0
          ? 'border-amber-300/70 bg-amber-400/10 shadow-[0_0_0_1px_rgba(251,191,36,0.24),0_8px_20px_rgba(0,0,0,0.22)]'
          : isDraft
            ? 'border-accent/70 bg-accent/10 shadow-[0_0_0_1px_rgba(65,150,72,0.22),0_8px_20px_rgba(0,0,0,0.22)]'
            : 'border-border bg-container2 shadow-[0_1px_2px_rgba(0,0,0,0.25)] hover:border-border2 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_8px_18px_rgba(0,0,0,0.18)]'
      } ${className}`}
      style={style}
    >
      <div className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: color }} />
      <span
        className={`absolute top-2 right-2 size-2 rounded-full bg-accent transition-[opacity,scale,filter] duration-200 ease-[cubic-bezier(0.2,0,0,1)] ${
          isDraft ? 'blur-0 scale-100 opacity-100' : 'scale-[0.25] opacity-0 blur-[4px]'
        }`}
      />
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-mono text-[10px] font-medium text-lightGrey">{course.courseCode ?? 'Course'}</p>
          <h3 className="mt-0.5 line-clamp-2 text-[13px] leading-snug font-semibold text-balance text-offwhite">
            {course.courseName ?? 'Unnamed course'}
          </h3>
        </div>
        <span className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-semibold ${getStatusClass(course)}`}>
          {getStatusLabel(course)}
        </span>
      </div>

      {validationWarnings.length > 0 && (
        <div className="mt-2 rounded-md border border-amber-300/40 bg-amber-300/10 px-2 py-1.5 text-[11px] leading-snug font-medium text-amber-100">
          <div className="flex items-start gap-1.5">
            <svg
              aria-hidden="true"
              className="mt-0.5 size-3.5 shrink-0 text-amber-200"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.485 2.495a1.75 1.75 0 0 1 3.03 0l6.28 10.875A1.75 1.75 0 0 1 16.28 16H3.72a1.75 1.75 0 0 1-1.515-2.63L8.485 2.495ZM10 6a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 6Zm0 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                clipRule="evenodd"
              />
            </svg>
            <div className="min-w-0 flex-1">
              <span className="line-clamp-3">{validationWarnings[0].message}</span>
              {validationWarnings[0].type === 'prerequisite' && onDismissValidationWarning && (
                <button
                  className="mt-1.5 rounded border border-amber-200/30 bg-amber-200/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-50 transition-[background-color,border-color] duration-150 hover:border-amber-100/50 hover:bg-amber-200/20"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDismissValidationWarning(validationWarnings[0].id);
                  }}
                  onPointerDown={(event) => event.stopPropagation()}
                  type="button"
                >
                  I have similar prerequisite
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {!compact && (
        <div className="mt-auto flex items-end justify-between gap-2 pt-2 text-xs text-lightGrey">
          <span className="truncate">{course.moduleName ?? 'No module'}</span>
          <span className="shrink-0 font-mono text-offwhite">{formatCredits(course.credits)}</span>
        </div>
      )}
    </motion.div>
  ),
);

TimelineCourseCard.displayName = 'TimelineCourseCard';

interface DraggableProps extends Props {
  disabled?: boolean;
}

export const DraggableTimelineCourseCard: React.FC<DraggableProps> = ({
  disabled = false,
  className = '',
  ...props
}) => {
  const { ref, isDragging } = useDraggable({
    id: `course:${props.course.courseUnitId}`,
    type: TIMELINE_COURSE_DRAG_TYPE,
    data: getCourseDragData(props.course),
    disabled,
  });
  const dragBlockedControls = useAnimationControls();
  const handlePointerDown: React.PointerEventHandler<HTMLDivElement> = (event) => {
    props.onPointerDown?.(event);
    if (!disabled) return;
    void dragBlockedControls.start({
      x: [0, -3, 3, -2, 2, 0],
      transition: { duration: 0.22, ease: 'easeOut' },
    });
  };

  return (
    <TimelineCourseCard
      {...props}
      className={`${disabled ? 'cursor-not-allowed opacity-85' : 'cursor-grab touch-none active:scale-[0.96] active:cursor-grabbing'} ${
        isDragging ? 'scale-[1.02] opacity-45 shadow-[0_12px_24px_rgba(0,0,0,0.28)]' : ''
      } ${className}`}
      dragBlockedControls={dragBlockedControls}
      onPointerDown={handlePointerDown}
      style={{
        ...props.style,
        cursor: disabled ? 'not-allowed' : props.style?.cursor,
        userSelect: disabled ? props.style?.userSelect : 'none',
      }}
      ref={ref}
    />
  );
};
