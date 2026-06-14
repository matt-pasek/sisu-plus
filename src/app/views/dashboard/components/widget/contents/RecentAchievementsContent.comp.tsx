import React from 'react';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { formatCredits } from '@/app/helpers/formatCredits';
import { DashboardCompletedCourse } from '@/app/views/dashboard/types/DashboardCompletedCourse.type';

export const RecentAchievementsContent: React.FC<{ courses: DashboardCompletedCourse[] }> = ({ courses }) => {
  const { t } = useTranslationWithPrefix('views.dashboard');

  return (
    <div className="-mx-4 my-0">
      {courses.slice(0, 8).map((course) => {
        const isHigh = typeof course.grade === 'number' && course.grade >= 4;
        return (
          <div
            key={course.id}
            className="flex items-center gap-3 border-b border-border px-4 py-3 transition-[background-color] duration-150 last:border-0 hover:bg-offwhite/2.5"
          >
            <span
              className="flex size-8.5 shrink-0 items-center justify-center rounded-[10px] font-mono text-sm font-bold tabular-nums"
              style={{
                background: isHigh ? 'rgba(82,201,137,0.12)' : 'rgba(91,141,246,0.12)',
                color: isHigh ? '#52c989' : '#5b8df6',
              }}
            >
              {course.grade === 'pass' ? t('grades.pass') : (course.grade ?? '✓')}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-offwhite">{course.name}</p>
              {course.code && <p className="mt-0.5 font-mono text-[10.5px] text-lightGrey">{course.code}</p>}
            </div>
            <span className="font-mono text-[11px] text-lightGrey">{formatCredits(course.credits)}</span>
          </div>
        );
      })}
      {courses.length === 0 && (
        <div className="flex items-center justify-center py-10 text-sm text-lightGrey">
          {t('widgets.analytics.noCompletedCourses')}
        </div>
      )}
    </div>
  );
};
