import React from 'react';
import type { TimelineCourse } from '@/app/api/dataPoints/getTimelineCourses';
import type { PeriodCreditSummary } from '@/app/api/dataPoints/getCreditsByPeriod';
import { TimelineCourseCard } from '@/app/views/timeline/components/TimelineCourseCard.comp';
import {
  formatCredits,
  formatPeriodRange,
  getCourseKey,
  getModuleColor,
  isCurrentPeriod,
} from '@/app/views/timeline/components/timelineUtils';

interface Props {
  period: PeriodCreditSummary;
  moduleIds: string[];
}

function sortCourses(courses: TimelineCourse[]): TimelineCourse[] {
  return [...courses].sort((a, b) => {
    if (a.isPassed !== b.isPassed) return a.isPassed ? -1 : 1;
    if (a.isEnrolled !== b.isEnrolled) return a.isEnrolled ? -1 : 1;
    return (a.courseName ?? '').localeCompare(b.courseName ?? '');
  });
}

export const TimelinePeriodColumn: React.FC<Props> = ({ period, moduleIds }) => {
  const current = isCurrentPeriod(period);
  const courses = sortCourses(period.courses);

  return (
    <section className="flex min-h-0 w-[280px] shrink-0 flex-col">
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

      <div className="flex min-h-[180px] flex-1 flex-col gap-2 rounded-lg border border-dashed border-border bg-background/30 p-2">
        {courses.length > 0 ? (
          courses.map((course) => (
            <TimelineCourseCard
              key={getCourseKey(course)}
              course={course}
              color={getModuleColor(course.moduleId, moduleIds)}
            />
          ))
        ) : (
          <div className="flex flex-1 items-center justify-center text-xs text-darkishGrey">No courses</div>
        )}
      </div>
    </section>
  );
};
