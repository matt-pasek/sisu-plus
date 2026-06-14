import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import type { ModuleColor } from '@/app/theme/moduleColors';
import { CourseEntry } from '@/app/views/structure/types';

interface Props {
  course: CourseEntry;
  color: ModuleColor;
  index?: number;
  onMethodClick?: () => void;
  onDetailsClick?: () => void;
  onCardClick?: () => void;
}

export const CourseCard: React.FC<Props> = ({
  course,
  color,
  index = 0,
  onMethodClick,
  onDetailsClick,
  onCardClick,
}) => {
  const { t } = useTranslationWithPrefix('views.structure');
  const prefersReducedMotion = useReducedMotion();

  const actionHandler = course.completed ? onDetailsClick : course.enrolled ? undefined : onMethodClick;
  const actionLabel = course.completed ? t('course.detailsAction') : t('course.methodAction');

  const statusLabel = course.completed
    ? t('course.completedLabel')
    : course.enrolled
      ? t('course.enrolledLabel')
      : t('course.notCompletedLabel');

  const statusColor = course.completed ? 'text-lighterGreen' : course.enrolled ? 'text-warn' : 'text-lightGrey';

  return (
    <motion.article
      layout="position"
      className={`group relative flex min-w-0 flex-col overflow-hidden rounded-xl bg-container2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)] transition-shadow duration-150 ease-out outline-none hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.09),0_16px_30px_-22px_rgba(0,0,0,0.8)] ${
        onCardClick ? 'cursor-pointer' : ''
      }`}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={prefersReducedMotion ? undefined : { y: -2 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.985 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1], delay: Math.min(index, 10) * 0.028 }}
      onClick={onCardClick}
    >
      <div className="flex min-h-29 flex-1 gap-3.5 px-4 pt-3.75 pb-3.5 pl-5">
        <span className="h-full w-1 rounded-full" style={{ backgroundColor: color.value }} />
        <div className="flex flex-1 items-start justify-between gap-3">
          <div className="flex flex-col gap-2">
            <h3 className="text-[14.5px] leading-[1.32] font-semibold text-pretty text-offwhite">
              {course.name ?? course.code ?? course.courseUnitId}
            </h3>
            <code className="block font-mono text-[11px] text-lightGrey">{course.code ?? course.courseUnitId}</code>
          </div>
          <div className="shrink-0 text-right">
            <div
              className={`font-mono text-lg leading-none font-bold tabular-nums ${
                course.completed ? 'text-lighterGreen' : 'text-darkishGrey'
              }`}
            >
              {course.completed ? (course.grade ?? 'Pass') : '-'}
            </div>
            <div className="mt-1.5 font-mono text-[11.5px] whitespace-nowrap text-lightGrey tabular-nums">
              {course.credits ?? 0} cr
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto flex min-h-11 items-end justify-between gap-2 border-t border-white/4.5 px-4 pt-2.5 pb-3 pl-5 text-[12.5px]">
        <div>
          <div className={`font-medium ${statusColor}`}>{statusLabel}</div>
          {!course.completed && !course.enrolled && course.completionMethodIndex != null && (
            <div className="mt-0.5 text-[11px] text-lightGrey/70">
              {t('course.methodSelectedLabel', { n: course.completionMethodIndex })}
            </div>
          )}
        </div>
        {actionHandler && (
          <motion.button
            type="button"
            className="cursor-pointer bg-transparent p-0 text-[13px] font-semibold transition-opacity hover:opacity-75 active:opacity-50"
            style={{ color: course.completed ? 'var(--color-offwhite)' : color.value }}
            whileHover={prefersReducedMotion ? undefined : { x: 1 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
            onClick={(e) => {
              e.stopPropagation();
              actionHandler();
            }}
          >
            {actionLabel}
          </motion.button>
        )}
      </div>
    </motion.article>
  );
};
