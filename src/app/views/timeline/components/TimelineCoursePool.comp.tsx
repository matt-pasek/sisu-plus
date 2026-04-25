import React from 'react';
import type { TimelineCourse } from '@/app/api/dataPoints/getTimelineCourses';
import { TimelineCourseCard } from '@/app/views/timeline/components/TimelineCourseCard.comp';
import { formatCredits, getCourseKey, getModuleColor } from '@/app/views/timeline/components/timelineUtils';

interface Props {
  unscheduledCourses: TimelineCourse[];
  moduleIds: string[];
}

export const TimelineCoursePool: React.FC<Props> = ({ unscheduledCourses, moduleIds }) => {
  const credits = unscheduledCourses.reduce((sum, course) => sum + (course.credits ?? 0), 0);

  return (
    <aside className="flex h-[calc(100dvh-96px)] w-[270px] shrink-0 flex-col border-r border-solid border-border bg-container px-4 py-5">
      <div>
        <h2 className="text-xs font-bold tracking-[0.16em] text-lightGrey uppercase">Course Pool</h2>
        <div className="mt-3 rounded-lg border border-border2 bg-container2 px-3 py-2 text-sm text-darkishGrey">
          Search...
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-lightGrey">
        <span>Outside shown timeline</span>
        <span className="font-mono tabular-nums">{formatCredits(credits)}</span>
      </div>
      <p className="mt-1 text-xs leading-snug text-darkishGrey">
        {unscheduledCourses.length} course{unscheduledCourses.length === 1 ? '' : 's'} without a visible timing period.
      </p>

      <div className="mt-5 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
        {unscheduledCourses.length > 0 ? (
          unscheduledCourses.map((course) => (
            <TimelineCourseCard
              key={getCourseKey(course)}
              course={course}
              color={getModuleColor(course.moduleId, moduleIds)}
              compact
            />
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-border p-4 text-sm text-lightGrey">
            Every planned course has a study period.
          </div>
        )}
      </div>
    </aside>
  );
};
