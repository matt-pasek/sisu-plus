import React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { LegacyAnimationControls } from 'motion/react';
import type { TimelineCourse } from '@/app/api/dataPoints/getTimelineCourses';
import { CourseCard } from '@/app/components/ui/CourseCard.comp';
import { StatusChip } from '@/app/components/ui/StatusChip.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { formatCredits } from '@/app/helpers/formatCredits';
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
    const statusLabel =
      course.isPassed && course.grade != null ? t('status.grade', { grade: course.grade }) : getStatusLabel(course);
    const hasWarnings = validationWarnings.length > 0;
    return (
      <CourseCard
        layout
        animate={dragBlockedControls}
        initial={false}
        onPointerDown={onPointerDown}
        ref={ref}
        transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
        title={`${courseName} · ${course.courseCode ? `${course.courseCode} · ` : ''}${formatCredits(course.credits)} · ${statusLabel}${
          hasWarnings ? ` · ${validationWarnings.map((warning) => warning.message).join(' ')}` : ''
        }`}
        data-course-id={course.courseUnitId}
        heading={<span className="line-clamp-2">{courseName}</span>}
        code={course.courseCode ?? t('course.fallback')}
        credits={formatCredits(course.credits)}
        metaAside={
          <>
            <AnimatePresence initial={false}>
              {isDraft && (
                <motion.span
                  key="draft-marker"
                  animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  className="size-2 shrink-0 rounded-full bg-accent"
                  exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.65, filter: 'blur(3px)' }}
                  initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.65, filter: 'blur(3px)' }}
                  transition={{ duration: shouldReduceMotion ? 0.01 : 0.16, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
            </AnimatePresence>
            {hasWarnings ? (
              <TimelineWarningChip warnings={validationWarnings} onDismiss={onDismissValidationWarning} />
            ) : (
              <StatusChip tone={getStatusTone(course)}>{statusLabel}</StatusChip>
            )}
          </>
        }
        headerClassName="min-h-0! py-2! [&>div:first-child]:w-full [&>div:first-child>div]:w-full [&_h3]:pr-0"
        stripeClassName=""
        stripeStyle={{ backgroundColor: color }}
        className={`rounded-lg border ${
          hasWarnings
            ? 'border-amber-300/60 bg-amber-400/7 shadow-[0_0_0_1px_rgba(251,191,36,0.18),0_6px_12px_rgba(0,0,0,0.18)]'
            : isDraft
              ? 'border-accent/70 bg-accent/10 shadow-[0_0_0_1px_rgba(65,150,72,0.22),0_8px_20px_rgba(0,0,0,0.22)]'
              : 'border-border bg-container2 shadow-[0_1px_2px_rgba(0,0,0,0.25)] hover:border-border2 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_8px_18px_rgba(0,0,0,0.18)]'
        } ${hasWarnings ? 'overflow-visible' : ''} ${className}`}
        style={style}
      >
        {onResizeRight && (
          <button
            aria-label={`Resize ${courseName}`}
            className="group/resize absolute top-3 -right-2 bottom-3 z-20 w-4 cursor-ew-resize rounded-full transition-[background-color,scale] duration-150 hover:bg-accent/25 active:scale-[0.96]"
            onPointerDown={(event) => {
              event.preventDefault();
              event.stopPropagation();

              const startX = event.clientX;
              let lastDelta = 0;
              const columnStep = 218;

              const handleMove = (moveEvent: PointerEvent) => {
                const deltaX = moveEvent.clientX - startX;
                const deltaColumns = Math.round(deltaX / columnStep);
                if (deltaColumns !== lastDelta) {
                  lastDelta = deltaColumns;
                  onResizeRight(deltaColumns);
                }
              };

              const handleUp = () => {
                window.removeEventListener('pointermove', handleMove);
                window.removeEventListener('pointerup', handleUp);
                window.removeEventListener('pointercancel', handleUp);
              };

              window.addEventListener('pointermove', handleMove);
              window.addEventListener('pointerup', handleUp);
              window.addEventListener('pointercancel', handleUp);
            }}
            type="button"
          ></button>
        )}
      </CourseCard>
    );
  },
);

TimelineCourseCard.displayName = 'TimelineCourseCard';
