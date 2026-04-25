import React from 'react';
import type { SemesterCreditSummary } from '@/app/api/dataPoints/getCreditsByPeriod';
import type { TimelineCourse } from '@/app/api/dataPoints/getTimelineCourses';
import { TimelineCourseCard } from '@/app/views/timeline/components/TimelineCourseCard.comp';
import {
  formatCredits,
  formatPeriodRange,
  getCourseKey,
  getModuleColor,
  getSemesterTitle,
  isCurrentPeriod,
  isCurrentSemester,
} from '@/app/views/timeline/components/timelineUtils';

interface Props {
  semester: SemesterCreditSummary;
  moduleIds: string[];
}

interface SemesterCourseBlock {
  course: TimelineCourse;
  startColumn: number;
  endColumn: number;
  row: number;
}

function sortCourses(courses: TimelineCourse[]): TimelineCourse[] {
  return [...courses].sort((a, b) => {
    if (a.isPassed !== b.isPassed) return a.isPassed ? -1 : 1;
    if (a.isEnrolled !== b.isEnrolled) return a.isEnrolled ? -1 : 1;
    return (a.courseName ?? '').localeCompare(b.courseName ?? '');
  });
}

function getSemesterCourseBlocks(semester: SemesterCreditSummary): SemesterCourseBlock[] {
  const periodIndexByLocator = new Map(semester.periods.map((period, index) => [period.periodLocator, index]));
  const uniqueCourses = new Map<string, TimelineCourse>();
  const rowEndColumns: number[] = [];

  for (const course of semester.courses) {
    uniqueCourses.set(getCourseKey(course), course);
  }

  return sortCourses([...uniqueCourses.values()]).map((course) => {
    const periodIndexes = course.plannedPeriods
      .map((period) => periodIndexByLocator.get(period.locator))
      .filter((index): index is number => index != null);

    const startColumn = Math.min(...periodIndexes);
    const endColumn = Math.max(...periodIndexes) + 1;
    const row = rowEndColumns.findIndex((endColumnForRow) => startColumn >= endColumnForRow);

    if (row >= 0) {
      rowEndColumns[row] = endColumn;
      return { course, startColumn, endColumn, row };
    }

    rowEndColumns.push(endColumn);
    return { course, startColumn, endColumn, row: rowEndColumns.length - 1 };
  });
}

export const TimelineSemesterColumn: React.FC<Props> = ({ semester, moduleIds }) => {
  const current = isCurrentSemester(semester);
  const courseBlocks = getSemesterCourseBlocks(semester);
  const rowCount = Math.max(courseBlocks.length > 0 ? Math.max(...courseBlocks.map((block) => block.row)) + 1 : 1, 2);
  const gridTemplateColumns = `repeat(${semester.periods.length}, 280px)`;

  return (
    <section className="flex min-h-0 shrink-0 flex-col">
      <div
        className={`mb-3 rounded-xl border px-5 py-3 ${
          current
            ? 'border-accent/70 bg-accent/10 shadow-[0_0_0_1px_rgba(65,150,72,0.2)]'
            : 'border-border bg-container'
        }`}
      >
        <div className="flex items-start justify-between gap-5">
          <div>
            <div className="flex items-center gap-2">
              {current && (
                <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] font-bold text-background">NOW</span>
              )}
              <h2 className="text-lg font-semibold text-offwhite">{getSemesterTitle(semester)}</h2>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            {semester.completedCredits > 0 && (
              <span className="rounded-full bg-lighterGreen/10 px-2 py-1 text-xs font-semibold text-lighterGreen">
                {formatCredits(semester.completedCredits)} done
              </span>
            )}
            {semester.plannedCredits > semester.completedCredits && (
              <span className="rounded-full bg-blue-400/10 px-2 py-1 text-xs font-semibold text-blue-300">
                {formatCredits(semester.plannedCredits - semester.completedCredits)} planned
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-3" style={{ gridTemplateColumns }}>
        {semester.periods.map((period) => (
          <div
            key={period.periodLocator}
            className={`rounded-lg border px-3 py-2 ${
              isCurrentPeriod(period) ? 'border-accent/70 bg-accent/10' : 'border-border bg-container'
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
        ))}
      </div>

      <div
        className="mt-3 grid gap-3"
        style={{
          gridTemplateColumns,
          gridTemplateRows: `repeat(${rowCount}, minmax(96px, auto))`,
        }}
      >
        {semester.periods.map((period, index) => (
          <div
            key={`${period.periodLocator}:background`}
            className="rounded-lg border border-dashed border-border bg-background/30"
            style={{ gridColumn: index + 1, gridRow: `1 / span ${rowCount}` }}
          />
        ))}

        {courseBlocks.length > 0 ? (
          courseBlocks.map((block) => (
            <TimelineCourseCard
              key={getCourseKey(block.course)}
              course={block.course}
              color={getModuleColor(block.course.moduleId, moduleIds)}
              className="z-10 min-h-24"
              style={{
                gridColumn: `${block.startColumn + 1} / ${block.endColumn + 1}`,
                gridRow: block.row + 1,
              }}
            />
          ))
        ) : (
          <div
            className="z-10 flex items-center justify-center text-xs text-darkishGrey"
            style={{ gridColumn: '1 / -1' }}
          >
            No courses
          </div>
        )}
      </div>
    </section>
  );
};
