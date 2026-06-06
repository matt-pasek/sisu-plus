import React from 'react';
import { CourseCard as SharedCourseCard } from '@/app/components/ui/CourseCard.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import type { ModuleColor } from '@/app/theme/moduleColors';
import { CourseEntry } from '@/app/views/structure/types';

interface Props {
  course: CourseEntry;
  color: ModuleColor;
  onMethodClick?: () => void;
  onDetailsClick?: () => void;
  onCardClick?: () => void;
}

export const CourseCard: React.FC<Props> = ({ course, color, onMethodClick, onDetailsClick, onCardClick }) => {
  const { t } = useTranslationWithPrefix('views.structure');

  const actionHandler = course.completed ? onDetailsClick : course.enrolled ? undefined : onMethodClick;
  const actionLabel = course.completed ? t('course.detailsAction') : t('course.methodAction');

  const statusLabel = course.completed
    ? t('course.completedLabel')
    : course.enrolled
      ? t('course.enrolledLabel')
      : t('course.notCompletedLabel');

  const statusColor = course.completed
    ? 'font-medium text-lighterGreen'
    : course.enrolled
      ? 'font-medium text-amber-400'
      : 'font-medium text-lightGrey';

  return (
    <SharedCourseCard
      badge={
        <div className="text-right">
          <div
            className={`font-mono tabular-nums ${
              course.completed ? 'text-base font-bold text-lighterGreen' : 'text-sm font-semibold text-lightGrey'
            }`}
          >
            {course.completed ? (course.grade ?? 'Pass') : '-'}
          </div>
          <div className="mt-0.5 font-mono text-xs text-lightGrey tabular-nums">{course.credits ?? 0} cr</div>
        </div>
      }
      className={`bg-container2 ${onCardClick ? 'cursor-pointer' : ''}`}
      code={course.code ?? course.courseUnitId}
      heading={course.name ?? course.code ?? course.courseUnitId}
      headerClassName="min-h-28"
      stripeClassName={color.accent}
      onClick={onCardClick}
      footer={
        <div className="flex min-h-5 items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <span className={statusColor}>{statusLabel}</span>
            {!course.completed && !course.enrolled && course.completionMethodIndex != null && (
              <span className="text-xs text-lightGrey/70">
                {t('course.methodSelectedLabel', { n: course.completionMethodIndex })}
              </span>
            )}
          </div>
          {actionHandler && (
            <button
              type="button"
              className={`font-semibold transition-opacity hover:opacity-75 active:opacity-50 ${course.completed ? 'text-offwhite' : color.text}`}
              onClick={(e) => {
                e.stopPropagation();
                actionHandler();
              }}
            >
              {actionLabel}
            </button>
          )}
        </div>
      }
    />
  );
};
