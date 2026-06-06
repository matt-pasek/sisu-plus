import React from 'react';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { formatCredits } from '@/app/helpers/formatCredits';
import type { DashboardCompletedCourse } from '../types/DashboardCompletedCourse.type';
import { formatCompactDate } from '../util/analyticsHelpers';

export const RecentAchievementsContent: React.FC<{ courses: DashboardCompletedCourse[] }> = ({ courses }) => {
  const { t } = useTranslationWithPrefix('views.dashboard');

  return (
    <div className="-mx-4 -my-2">
      {courses.slice(0, 8).map((course) => (
        <div key={course.id} className="flex items-center gap-3 border-b border-border/60 px-4 py-2.5 last:border-0">
          <span
            className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold tabular-nums ${
              typeof course.grade === 'number' && course.grade >= 4
                ? 'bg-lighterGreen/10 text-lighterGreen'
                : 'bg-blue-400/10 text-blue-300'
            }`}
          >
            {course.grade === 'pass' ? t('grades.pass') : (course.grade ?? '✓')}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-offwhite">{course.name}</p>
            <p className="text-xs text-lightGrey">{formatCompactDate(course.registrationDate)}</p>
          </div>
          <span className="font-mono text-xs text-lightGrey">{formatCredits(course.credits)}</span>
        </div>
      ))}
      {courses.length === 0 && (
        <div className="flex items-center justify-center py-10 text-sm text-lightGrey">
          {t('widgets.analytics.noCompletedCourses')}
        </div>
      )}
    </div>
  );
};
