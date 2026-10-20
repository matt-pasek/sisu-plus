import React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { LegacyAnimationControls } from 'motion/react';
import type { TimelineCourse } from '@/app/api/dataPoints/getTimelineCourses';
import { CourseCard } from '@/app/components/ui/CourseCard.comp';
import { StatusChip } from '@/app/components/ui/StatusChip.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { formatCredits } from '@/app/helpers/formatCredits';
import { BOARD_GAP, COURSE_CARD_HEIGHT, PERIOD_WIDTH } from '@/app/views/timeline/constants/board.const';
import { getStatusLabel, getStatusTone } from '@/app/views/timeline/util/getStatusLabel';
import type { TimelineValidationWarning } from '@/app/views/timeline/util/timelineValidation';
import { TimelineWarningChip } from './TimelineWarningChip.comp';

// TODO: take care of deprecated LegacyAnimationControls
export interface TimelineCourseCardProps {
  course: TimelineCourse;
  color: string;
  className?: string;
  dragBlockedControls?: LegacyAnimationControls;
  dragPeriodCount?: number;
  isDraft?: boolean;
  onDismissValidationWarning?: (warningId: string) => void;
  onPointerDown?: React.PointerEventHandler<HTMLDivElement>;
  onResizeRight?: (delta: number) => void;
  style?: React.CSSProperties;
  validationWarnings?: TimelineValidationWarning[];
}

const COLUMN_STEP = PERIOD_WIDTH + BOARD_GAP;

const SURFACE = {
  warning: 'shadow-[0_0_0_1px_rgba(252,211,77,0.6),0_0_0_4px_rgba(251,191,36,0.08)]',
  draft: 'shadow-[0_0_0_1px_rgba(65,150,72,0.7),0_0_0_4px_rgba(65,150,72,0.08)]',
  rest: 'shadow-[0_0_0_1px_rgba(255,255,255,0.055),0_14px_34px_-28px_rgba(0,0,0,0.8)] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.11),0_18px_38px_-28px_rgba(0,0,0,0.85)]',
};

const startResize = (event: React.PointerEvent<HTMLButtonElement>, onResizeRight: (delta: number) => void) => {
  event.preventDefault();
  event.stopPropagation();
  const startX = event.clientX;
  let lastDelta = 0;

  const handleMove = (moveEvent: PointerEvent) => {
    const deltaColumns = Math.round((moveEvent.clientX - startX) / COLUMN_STEP);
    if (deltaColumns === lastDelta) return;
    lastDelta = deltaColumns;
    onResizeRight(deltaColumns);
  };
  const handleUp = () => {
    window.removeEventListener('pointermove', handleMove);
    window.removeEventListener('pointerup', handleUp);
    window.removeEventListener('pointercancel', handleUp);
  };

  window.addEventListener('pointermove', handleMove);
  window.addEventListener('pointerup', handleUp);
  window.addEventListener('pointercancel', handleUp);
};

export const TimelineCourseCard = React.forwardRef<HTMLDivElement, TimelineCourseCardProps>(
  (
    {
      course,
      color,
      className = '',
      dragBlockedControls,
      isDraft = false,
      onDismissValidationWarning,
      onPointerDown,
      onResizeRight,
      style,
      validationWarnings = [],
    },
    ref,
  ) => {
    const { t } = useTranslationWithPrefix('views.timeline');
    const shouldReduceMotion = useReducedMotion();
    const courseName = course.courseName ?? t('course.unnamed');
    const code = course.courseCode ?? t('course.fallback');
    const credits = formatCredits(course.credits);
    const statusLabel =
      course.isPassed && course.grade != null ? t('status.grade', { grade: course.grade }) : getStatusLabel(course);
    const hasWarnings = validationWarnings.length > 0;
    const surface = hasWarnings ? SURFACE.warning : isDraft ? SURFACE.draft : SURFACE.rest;

    return (
      <CourseCard
        layout
        animate={dragBlockedControls}
        initial={false}
        onPointerDown={onPointerDown}
        ref={ref}
        transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
        title={`${courseName} · ${course.courseCode ? `${course.courseCode} · ` : ''}${credits} · ${statusLabel}${
          hasWarnings ? ` · ${validationWarnings.map((warning) => warning.message).join(' ')}` : ''
        }`}
        data-course-id={course.courseUnitId}
        heading={courseName}
        code={code}
        credits={credits}
        edgeColor={color}
        badge={
          hasWarnings ? (
            <TimelineWarningChip warnings={validationWarnings} onDismiss={onDismissValidationWarning} />
          ) : (
            <StatusChip tone={getStatusTone(course)}>{statusLabel}</StatusChip>
          )
        }
        className={`${surface} ${className}`}
        style={{ height: COURSE_CARD_HEIGHT, ...style }}
      >
        <AnimatePresence initial={false}>
          {isDraft && (
            <motion.span
              key="draft-marker"
              aria-hidden="true"
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, filter: 'blur(0px)' }}
              className="absolute top-2 right-2 size-1.5 rounded-full bg-lighterGreen"
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.65, filter: 'blur(3px)' }}
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.65, filter: 'blur(3px)' }}
              transition={{ duration: shouldReduceMotion ? 0.01 : 0.16, ease: [0.22, 1, 0.36, 1] }}
            />
          )}
        </AnimatePresence>
        {onResizeRight && (
          <button
            aria-label={t('course.resize', { course: courseName })}
            className="group/resize absolute top-3 -right-2 bottom-3 z-20 w-4 cursor-ew-resize rounded-full transition-[background-color,scale] duration-150 hover:bg-accent/25 active:scale-[0.96]"
            onPointerDown={(event) => startResize(event, onResizeRight)}
            type="button"
          ></button>
        )}
      </CourseCard>
    );
  },
);

TimelineCourseCard.displayName = 'TimelineCourseCard';
