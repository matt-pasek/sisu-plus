import React from 'react';
import type { PeriodCreditSummary, SemesterCreditSummary } from '@/app/api/dataPoints/getCreditsByPeriod';
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
  semesters: SemesterCreditSummary[];
  moduleIds: string[];
}

interface VisiblePeriod {
  period: PeriodCreditSummary;
  semester: SemesterCreditSummary;
}

interface CourseBlock {
  course: TimelineCourse;
  startColumn: number;
  endColumn: number;
  row: number;
}

const PERIOD_WIDTH = 210;

function getTotalCredits(
  summary: Pick<PeriodCreditSummary | SemesterCreditSummary, 'plannedCredits' | 'completedCredits'>,
): number {
  return summary.plannedCredits + summary.completedCredits;
}

const CreditChip: React.FC<{ label: string; credits: number; variant: 'completed' | 'planned' }> = ({
  label,
  credits,
  variant,
}) => {
  const variantClass =
    variant === 'completed'
      ? 'bg-lighterGreen/10 text-lighterGreen ring-lighterGreen/10'
      : 'bg-blue-400/10 text-blue-300 ring-blue-400/10';

  return (
    <span
      title={`${label}: ${formatCredits(credits)}`}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tabular-nums ring-1 ${variantClass}`}
    >
      <span className="text-[10px] font-medium opacity-80">{label}</span>
      <span>{formatCredits(credits)}</span>
    </span>
  );
};

function sortCourses(courses: TimelineCourse[]): TimelineCourse[] {
  return [...courses].sort((a, b) => {
    if (a.isPassed !== b.isPassed) return a.isPassed ? -1 : 1;
    if (a.isEnrolled !== b.isEnrolled) return a.isEnrolled ? -1 : 1;
    return (a.courseName ?? '').localeCompare(b.courseName ?? '');
  });
}

function getCourseBlocks(semesters: SemesterCreditSummary[], periods: VisiblePeriod[]): CourseBlock[] {
  const periodIndexByLocator = new Map(periods.map(({ period }, index) => [period.periodLocator, index]));
  const uniqueCourses = new Map<string, TimelineCourse>();
  const rowEndColumns: number[] = [];

  for (const semester of semesters) {
    for (const course of semester.courses) {
      uniqueCourses.set(getCourseKey(course), course);
    }
  }

  return sortCourses([...uniqueCourses.values()]).flatMap((course) => {
    const plannedPeriodIndexes = course.plannedPeriods
      .map((period) => periodIndexByLocator.get(period.locator))
      .filter((index): index is number => index != null);
    const completionPeriodIndex = course.completionPeriod
      ? periodIndexByLocator.get(course.completionPeriod.locator)
      : undefined;
    const periodIndexes =
      plannedPeriodIndexes.length > 0
        ? plannedPeriodIndexes
        : completionPeriodIndex != null
          ? [completionPeriodIndex]
          : [];

    if (periodIndexes.length === 0) return [];

    const startColumn = Math.min(...periodIndexes);
    const endColumn = Math.max(...periodIndexes) + 1;
    const row = rowEndColumns.findIndex((endColumnForRow) => startColumn >= endColumnForRow);

    if (row >= 0) {
      rowEndColumns[row] = endColumn;
      return [{ course, startColumn, endColumn, row }];
    }

    rowEndColumns.push(endColumn);
    return [{ course, startColumn, endColumn, row: rowEndColumns.length - 1 }];
  });
}

export const TimelineBoard: React.FC<Props> = ({ semesters, moduleIds }) => (
  <TimelineBoardContent semesters={semesters} moduleIds={moduleIds} />
);

const TimelineBoardContent: React.FC<Props> = ({ semesters, moduleIds }) => {
  const visiblePeriods = semesters.flatMap((semester) => semester.periods.map((period) => ({ period, semester })));
  const courseBlocks = getCourseBlocks(semesters, visiblePeriods);
  const rowCount = Math.max(courseBlocks.length > 0 ? Math.max(...courseBlocks.map((block) => block.row)) + 1 : 1, 3);
  const gridTemplateColumns = `repeat(${visiblePeriods.length}, ${PERIOD_WIDTH}px)`;
  let periodOffset = 0;

  return (
    <main className="min-w-0 flex-1 overflow-auto bg-background">
      <div className="min-h-full w-max px-5 py-5">
        {semesters.length > 0 ? (
          <>
            <div className="grid gap-2" style={{ gridTemplateColumns }}>
              {semesters.map((semester) => {
                const startColumn = periodOffset + 1;
                periodOffset += semester.periods.length;

                return (
                  <div
                    key={`${semester.studyYear}:${semester.termName}`}
                    className={`rounded-lg border px-4 py-2 ${
                      isCurrentSemester(semester)
                        ? 'border-accent/70 bg-accent/10 shadow-[0_0_0_1px_rgba(65,150,72,0.2)]'
                        : 'border-border bg-container'
                    }`}
                    style={{ gridColumn: `${startColumn} / span ${semester.periods.length}` }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate text-base font-semibold text-offwhite">{getSemesterTitle(semester)}</h2>
                      </div>
                      <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
                        {semester.completedCredits > 0 && (
                          <CreditChip label="Done" credits={semester.completedCredits} variant="completed" />
                        )}
                        {semester.plannedCredits > 0 && (
                          <CreditChip label="Planned" credits={semester.plannedCredits} variant="planned" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-2 grid gap-2" style={{ gridTemplateColumns }}>
              {visiblePeriods.map(({ period }) => (
                <div
                  key={period.periodLocator}
                  title={`Workload in ${period.period.name}: ${formatCredits(getTotalCredits(period))}`}
                  className={`rounded-lg border px-3 py-2 ${
                    isCurrentPeriod(period) ? 'border-accent/70 bg-accent/10' : 'border-border bg-container'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-offwhite">{period.period.name}</p>
                      <p className="mt-0.5 truncate text-xs text-lightGrey">
                        {formatPeriodRange(period.period.startDate, period.period.endDate)}
                      </p>
                    </div>
                    <span className="shrink-0 font-mono text-xs text-lightGrey tabular-nums">
                      {formatCredits(getTotalCredits(period))}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div
              className="mt-2 grid gap-2"
              style={{
                gridTemplateColumns,
                gridTemplateRows: `repeat(${rowCount}, minmax(74px, auto))`,
              }}
            >
              {visiblePeriods.map(({ period }, index) => (
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
                    className="z-10 min-h-[74px]"
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
          </>
        ) : (
          <div className="flex h-64 w-[70vw] items-center justify-center rounded-xl border border-dashed border-border text-sm text-lightGrey">
            No timeline periods available yet.
          </div>
        )}
      </div>
    </main>
  );
};
