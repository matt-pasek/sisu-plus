import React from 'react';
import { CourseCard as SharedCourseCard } from '@/app/components/ui/CourseCard.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import type { ModuleColor } from '@/app/theme/moduleColors';
import type { CourseEntry } from '@/app/views/structure/structureTypes';

interface Props {
  course: CourseEntry;
  color: ModuleColor;
}

export const CourseCard: React.FC<Props> = ({ course, color }) => {
  const { t } = useTranslationWithPrefix('views.structure');

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
      className="bg-container2"
      code={course.code ?? course.courseUnitId}
      heading={course.name ?? course.code ?? course.courseUnitId}
      headerClassName="min-h-28"
      stripeClassName={color.accent}
      footer={
        <div className="flex min-h-5 items-center justify-between gap-3">
          <span className={course.completed ? 'font-medium text-lighterGreen' : 'font-medium text-lightGrey'}>
            {course.completed ? t('course.completedLabel') : t('course.notCompletedLabel')}
          </span>
          <span className={`font-semibold ${course.completed ? 'text-offwhite' : color.text}`}>
            {course.completed ? t('course.detailsAction') : t('course.methodAction')}
          </span>
        </div>
      }
    />
  );
};
