import React from 'react';
import { useNavigate } from 'react-router';
import type { PeriodCreditSummary } from '@/app/api/dataPoints/getCreditsByPeriod';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { formatCredits } from '@/app/helpers/formatCredits';
import { getModuleColor } from '@/app/theme/moduleColors';

export const TimelinePeekContent: React.FC<{
  moduleIds: string[];
  periods: PeriodCreditSummary[];
}> = ({ moduleIds, periods }) => {
  const { t } = useTranslationWithPrefix('views.dashboard');
  const navigate = useNavigate();
  const now = new Date();
  const upcoming = periods
    .filter((period) => new Date(period.period.endDate) >= now && period.courses.some((course) => !course.isPassed))
    .slice(0, 3);

  return (
    <button
      className="-m-1 flex h-[calc(100%+8px)] w-full cursor-pointer flex-col gap-2 rounded-xl p-1 text-left transition-[background-color,transform] duration-200 active:scale-[0.96]"
      onClick={() => navigate('/student/plan')}
      type="button"
    >
      {upcoming.map((period) => (
        <div
          key={period.periodLocator}
          className="rounded-xl bg-background/45 p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]"
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold text-offwhite">{period.period.name}</p>
            <span className="font-mono text-xs text-lightGrey">{formatCredits(period.plannedCredits)}</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {period.courses
              .filter((course) => !course.isPassed)
              .slice(0, 3)
              .map((course) => {
                const color = getModuleColor(course.moduleId, moduleIds);
                return (
                  <div key={course.courseUnitId} className="min-w-0 rounded-lg bg-container2 px-2 py-1.5">
                    <p className="truncate text-xs font-semibold text-offwhite">
                      {course.courseName ?? t('widgets.analytics.courseFallback')}
                    </p>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <span className="truncate text-[10px]" style={{ color }}>
                        {course.moduleName ?? t('widgets.analytics.noModule')}
                      </span>
                      <span className="font-mono text-[10px] text-lightGrey">{formatCredits(course.credits)}</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ))}
      {upcoming.length === 0 && (
        <div className="flex flex-1 items-center justify-center text-sm text-lightGrey">
          {t('widgets.analytics.noUpcomingCourses')}
        </div>
      )}
    </button>
  );
};
