import React from 'react';
import type { PeriodCreditSummary } from '@/app/api/dataPoints/getCreditsByPeriod';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { formatCredits } from '@/app/helpers/formatCredits';
import { getModuleColor } from '@/app/theme/moduleColors';

export const TimelinePeekContent: React.FC<{
  periods: PeriodCreditSummary[];
}> = ({ periods }) => {
  const { t } = useTranslationWithPrefix('views.dashboard');
  const now = new Date();
  const upcoming = periods
    .filter((period) => new Date(period.period.endDate) >= now && period.courses.some((course) => !course.isPassed))
    .slice(0, 3);

  return (
    <div className="flex h-full w-full flex-col gap-2">
      {upcoming.map((period) => (
        <div
          key={period.periodLocator}
          className="w-full rounded-xl bg-background/45 p-2.5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]"
        >
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <p className="truncate text-[12px] font-semibold text-offwhite">{period.period.name}</p>
            <span className="font-mono text-[11px] text-lightGrey">{formatCredits(period.plannedCredits)}</span>
          </div>
          <div className="flex flex-col gap-1">
            {period.courses
              .filter((course) => !course.isPassed)
              .slice(0, 4)
              .map((course) => {
                const color = getModuleColor(course.moduleId);
                return (
                  <div
                    key={course.courseUnitId}
                    className="flex min-w-0 items-center gap-2 rounded-[8px] bg-container2 px-2 py-1.5"
                  >
                    <span className="size-[6px] shrink-0 rounded-full" style={{ background: color }} />
                    <p className="min-w-0 flex-1 truncate text-[11.5px] font-medium text-offwhite">
                      {course.courseName ?? t('widgets.analytics.courseFallback')}
                    </p>
                    <span className="shrink-0 font-mono text-[10px] text-lightGrey">
                      {formatCredits(course.credits)}
                    </span>
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
    </div>
  );
};
