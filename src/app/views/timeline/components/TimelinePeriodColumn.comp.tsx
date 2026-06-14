import React from 'react';
import type { PeriodCreditSummary } from '@/app/api/dataPoints/getCreditsByPeriod';
import { TimelineCourseCard } from '@/app/views/timeline/components/TimelineCourseCard.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { sortCourses } from '@/app/views/timeline/util/sortCourses';
import { formatPeriodRange } from '@/app/views/timeline/util/formatPeriodRange';
import { isCurrentPeriod } from '@/app/views/timeline/util/getVisibleSemesters';
import { formatCredits } from '@/app/helpers/formatCredits';
import { getCourseKey } from '@/app/views/timeline/util/getCourseKey';
import { getModuleColor } from '@/app/theme/moduleColors';

interface Props {
  period: PeriodCreditSummary;
}

export const TimelinePeriodColumn: React.FC<Props> = ({ period }) => {
  const { t } = useTranslationWithPrefix('views.timeline');
  const current = isCurrentPeriod(period);
  const courses = sortCourses(period.courses);

  return (
    <section className="flex min-h-0 w-70 shrink-0 flex-col">
      <div
        className={`mb-3 rounded-lg border px-3 py-2 ${
          current ? 'border-accent/70 bg-accent/10' : 'border-border bg-container'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-offwhite">{period.period.name}</p>
            <p className="mt-0.5 text-xs text-lightGrey">
              {formatPeriodRange(period.period.startDate, period.period.endDate)}
            </p>
          </div>
          <span className="shrink-0 font-mono text-xs text-lightGrey">{formatCredits(period.plannedCredits)}</span>
        </div>
      </div>

      <div className="flex min-h-45 flex-1 flex-col gap-2 rounded-lg border border-dashed border-border bg-background/30 p-2">
        {courses.length > 0 ? (
          courses.map((course) => (
            <TimelineCourseCard key={getCourseKey(course)} course={course} color={getModuleColor(course.moduleId)} />
          ))
        ) : (
          <div className="flex flex-1 items-center justify-center text-xs text-darkishGrey">{t('board.noCourses')}</div>
        )}
      </div>
    </section>
  );
};
