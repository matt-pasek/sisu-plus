import React, { useId, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { LegacyAnimationControls } from 'motion/react';
import type { TimelineCourse } from '@/app/api/dataPoints/getTimelineCourses';
import { CourseCard } from '@/app/components/ui/CourseCard.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { formatCredits } from '@/app/helpers/formatCredits';
import type { TimelineValidationWarning } from '@/app/views/timeline/util/timelineValidation';
import { getStatusLabel } from '@/app/views/timeline/util/getStatusLabel';

// TODO: take care of deprecated LegacyAnimationControls
export interface TimelineCourseCardProps {
  course: TimelineCourse;
  color: string;
  compact?: boolean;
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

const getTimelineStatusClass = (course: TimelineCourse): string => {
  if (course.isPassed) return 'border-lighterGreen/25 bg-lighterGreen/10 text-lighterGreen';
  if (course.isEnrolled) return 'border-blue-400/25 bg-blue-400/10 text-blue-300';
  return 'border-warn/25 bg-warn/10 text-warn';
};

const WarningIcon: React.FC = () => (
  <svg aria-hidden="true" className="size-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
    <path
      clipRule="evenodd"
      d="M8.485 2.495a1.75 1.75 0 0 1 3.03 0l6.28 10.875A1.75 1.75 0 0 1 16.28 16H3.72a1.75 1.75 0 0 1-1.515-2.63L8.485 2.495ZM10 6a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 6Zm0 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
      fillRule="evenodd"
    />
  </svg>
);

export const TimelineCourseCard = React.forwardRef<HTMLDivElement, TimelineCourseCardProps>(
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
      onResizeRight,
      style,
      validationWarnings = [],
    },
    ref,
  ) => {
    const { t } = useTranslationWithPrefix('views.timeline');
    const tooltipId = useId();
    const [warningTooltipVisible, setWarningTooltipVisible] = useState(false);
    const shouldReduceMotion = useReducedMotion();
    const courseName = course.courseName ?? t('course.unnamed');
    const statusLabel =
      course.isPassed && course.grade != null ? t('status.grade', { grade: course.grade }) : getStatusLabel(course);
    const primaryWarning = validationWarnings[0];
    const warningMessage = validationWarnings.map((warning) => warning.message).join(' ');
    const warningLabel =
      validationWarnings.length > 1
        ? t('course.warningCount', { count: validationWarnings.length })
        : t(primaryWarning?.type === 'prerequisite' ? 'course.prerequisiteWarning' : 'course.periodWarning');
    const canDismissPrerequisite = primaryWarning?.type === 'prerequisite' && onDismissValidationWarning != null;
    const showWarningTooltip = primaryWarning != null && warningTooltipVisible;
    const hideWarningTooltip = () => setWarningTooltipVisible(false);
    const showWarningTooltipNow = () => setWarningTooltipVisible(true);
    return (
      <CourseCard
        layout
        animate={dragBlockedControls}
        initial={false}
        onPointerDown={onPointerDown}
        ref={ref}
        transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
        title={`${courseName} · ${formatCredits(course.credits)} · ${statusLabel}${
          validationWarnings.length > 0 ? ` · ${validationWarnings.map((warning) => warning.message).join(' ')}` : ''
        }`}
        heading={courseName}
        code={course.courseCode ?? t('course.fallback')}
        credits={formatCredits(course.credits)}
        headerClassName={`${compact ? 'min-h-0!' : 'min-h-18.5'} py-2 [&>div:first-child]:w-full [&>div:first-child>div]:w-full [&_h3]:pr-0`}
        stripeClassName=""
        stripeStyle={{ backgroundColor: color }}
        className={`rounded-lg border ${
          validationWarnings.length > 0
            ? 'border-amber-300/60 bg-amber-400/7 shadow-[0_0_0_1px_rgba(251,191,36,0.18),0_6px_12px_rgba(0,0,0,0.18)]'
            : isDraft
              ? 'border-accent/70 bg-accent/10 shadow-[0_0_0_1px_rgba(65,150,72,0.22),0_8px_20px_rgba(0,0,0,0.22)]'
              : 'border-border bg-container2 shadow-[0_1px_2px_rgba(0,0,0,0.25)] hover:border-border2 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_8px_18px_rgba(0,0,0,0.18)]'
        } ${primaryWarning ? 'overflow-visible' : ''} ${className}`}
        style={style}
      >
        <AnimatePresence initial={false}>
          {isDraft && (
            <motion.span
              key="draft-marker"
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, filter: 'blur(0px)' }}
              className="absolute top-2 right-2 size-2 rounded-full bg-accent"
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.65, filter: 'blur(3px)' }}
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.65, filter: 'blur(3px)' }}
              transition={{ duration: shouldReduceMotion ? 0.01 : 0.16, ease: [0.22, 1, 0.36, 1] }}
            />
          )}
        </AnimatePresence>

        {!compact && (
          <div className="mx-3.5 -mt-1 mb-2 flex items-center justify-between gap-2">
            <span className="min-w-0 truncate text-xs text-lightGrey">{course.moduleName ?? t('course.noModule')}</span>
            <span
              className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] leading-none font-semibold ${getTimelineStatusClass(course)}`}
            >
              {statusLabel}
            </span>
            {primaryWarning && (
              <span
                className="relative shrink-0"
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget)) hideWarningTooltip();
                }}
                onFocus={showWarningTooltipNow}
                onPointerEnter={showWarningTooltipNow}
                onPointerLeave={hideWarningTooltip}
              >
                <button
                  aria-describedby={tooltipId}
                  aria-expanded={showWarningTooltip}
                  aria-label={`${warningLabel}: ${warningMessage}`}
                  className="flex min-h-5 max-w-20 items-center gap-1 rounded-md border border-amber-300/35 bg-amber-300/10 px-1.5 text-[10px] leading-none font-semibold text-amber-100 transition-[background-color,border-color,transform] duration-150 hover:border-amber-200/60 hover:bg-amber-300/18 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200/70 active:scale-[0.96]"
                  onPointerDown={(event) => event.stopPropagation()}
                  type="button"
                >
                  <WarningIcon />
                  <span className="truncate">{warningLabel}</span>
                </button>
                <AnimatePresence initial={false}>
                  {showWarningTooltip && (
                    <motion.span
                      key="warning-tooltip"
                      animate={
                        shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }
                      }
                      className="absolute right-0 bottom-full z-50 mb-2 w-72 rounded-lg border border-amber-300/35 bg-[#2b2619] p-3 text-left text-amber-50 shadow-[0_14px_34px_rgba(0,0,0,0.38)]"
                      exit={
                        shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 3, filter: 'blur(2px)' }
                      }
                      id={tooltipId}
                      initial={
                        shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 3, filter: 'blur(2px)' }
                      }
                      role="tooltip"
                      transition={{ duration: shouldReduceMotion ? 0.01 : 0.16, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <span className="flex items-start gap-2">
                        <span className="mt-0.5 text-amber-200">
                          <WarningIcon />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-xs leading-snug font-semibold text-amber-50">
                            {warningMessage}
                          </span>
                          {canDismissPrerequisite && (
                            <button
                              className="mt-2 rounded-md border border-amber-200/30 bg-amber-200/10 px-2 py-1 text-[11px] leading-none font-semibold text-amber-50 transition-[background-color,border-color,transform] duration-150 hover:border-amber-100/50 hover:bg-amber-200/20 active:scale-[0.96]"
                              onClick={(event) => {
                                event.stopPropagation();
                                onDismissValidationWarning(primaryWarning.id);
                                hideWarningTooltip();
                              }}
                              onPointerDown={(event) => event.stopPropagation()}
                              type="button"
                            >
                              {t('course.dismissPrerequisite')}
                            </button>
                          )}
                        </span>
                      </span>
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
            )}
          </div>
        )}

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
