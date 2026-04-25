import React from 'react';
import { useDroppable } from '@dnd-kit/react';
import type { PeriodCreditSummary, SemesterCreditSummary } from '@/app/api/dataPoints/getCreditsByPeriod';
import type { TimelineCourse } from '@/app/api/dataPoints/getTimelineCourses';
import { DraggableTimelineCourseCard } from '@/app/views/timeline/components/TimelineCourseCard.comp';
import { TIMELINE_COURSE_DRAG_TYPE } from '@/app/views/timeline/components/timelineDnd';
import {
  formatCredits,
  formatPeriodRange,
  getCourseKey,
  getModuleColor,
  getSemesterTitle,
  isCurrentPeriod,
  isCurrentSemester,
} from '@/app/views/timeline/components/timelineUtils';
import type { TimelineValidationWarning } from '@/app/views/timeline/components/timelineValidation';

interface Props {
  draftCourseIds?: Set<string>;
  highlightedPeriodLocators?: Set<string>;
  isDragging?: boolean;
  onDismissValidationWarning?: (warningId: string) => void;
  semesters: SemesterCreditSummary[];
  moduleIds: string[];
  validationWarnings?: Map<string, TimelineValidationWarning[]>;
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

const PeriodDropCell: React.FC<{
  index: number;
  hasHighlightedDropPeriods: boolean;
  isHighlighted: boolean;
  isDragging: boolean;
  period: PeriodCreditSummary;
  rowCount: number;
}> = ({ index, hasHighlightedDropPeriods, isHighlighted, isDragging, period, rowCount }) => {
  const { ref, isDropTarget } = useDroppable({
    id: `period:${period.periodLocator}`,
    accept: TIMELINE_COURSE_DRAG_TYPE,
    data: { kind: 'timeline-period', periodLocator: period.periodLocator },
  });

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden rounded-lg border border-dashed transition-[border-color,background-color,box-shadow,scale] duration-200 ease-out ${
        isDropTarget
          ? 'z-30 scale-[1.01] border-accent bg-accent/10 shadow-[0_0_0_1px_rgba(65,150,72,0.28),inset_0_0_24px_rgba(65,150,72,0.06)]'
          : isDragging && hasHighlightedDropPeriods && isHighlighted
            ? 'z-20 border-accent/60 bg-accent/10 shadow-[inset_0_0_0_1px_rgba(65,150,72,0.16)]'
            : isDragging && hasHighlightedDropPeriods
              ? 'border-border bg-background/20 opacity-45'
              : isDragging
                ? 'border-border2 bg-container/25 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]'
                : 'border-border bg-background/30'
      }`}
      style={{ gridColumn: index + 1, gridRow: `1 / span ${rowCount}` }}
    >
      <div
        className={`pointer-events-none absolute inset-x-3 top-2 z-40 rounded-md border border-accent/60 bg-accent px-2 py-1.5 text-center text-xs font-semibold text-offwhite shadow-[0_8px_20px_rgba(0,0,0,0.28)] transition-[opacity,scale,filter] duration-200 ease-[cubic-bezier(0.2,0,0,1)] ${
          isDropTarget || (isDragging && isHighlighted)
            ? 'blur-0 scale-100 opacity-100'
            : 'scale-[0.25] opacity-0 blur-[4px]'
        }`}
      >
        {isDropTarget ? 'Drop here' : 'Offered here'}
      </div>
    </div>
  );
};

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

export const TimelineBoard: React.FC<Props> = ({
  draftCourseIds = new Set(),
  highlightedPeriodLocators = new Set(),
  isDragging = false,
  onDismissValidationWarning,
  semesters,
  moduleIds,
  validationWarnings = new Map(),
}) => (
  <TimelineBoardContent
    draftCourseIds={draftCourseIds}
    highlightedPeriodLocators={highlightedPeriodLocators}
    isDragging={isDragging}
    onDismissValidationWarning={onDismissValidationWarning}
    semesters={semesters}
    moduleIds={moduleIds}
    validationWarnings={validationWarnings}
  />
);

const TimelineBoardContent: React.FC<Props> = ({
  draftCourseIds = new Set(),
  highlightedPeriodLocators = new Set(),
  isDragging = false,
  onDismissValidationWarning,
  semesters,
  moduleIds,
  validationWarnings = new Map(),
}) => {
  const visiblePeriods = semesters.flatMap((semester) => semester.periods.map((period) => ({ period, semester })));
  const courseBlocks = getCourseBlocks(semesters, visiblePeriods);
  const rowCount = Math.max(courseBlocks.length > 0 ? Math.max(...courseBlocks.map((block) => block.row)) + 1 : 1, 3);
  const gridTemplateColumns = `repeat(${visiblePeriods.length}, ${PERIOD_WIDTH}px)`;
  const hasHighlightedDropPeriods = highlightedPeriodLocators.size > 0;
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
                <PeriodDropCell
                  key={`${period.periodLocator}:background`}
                  index={index}
                  hasHighlightedDropPeriods={hasHighlightedDropPeriods}
                  isHighlighted={highlightedPeriodLocators.has(period.periodLocator)}
                  isDragging={isDragging}
                  period={period}
                  rowCount={rowCount}
                />
              ))}

              {courseBlocks.length > 0 ? (
                courseBlocks.map((block) => (
                  <DraggableTimelineCourseCard
                    key={getCourseKey(block.course)}
                    course={block.course}
                    color={getModuleColor(block.course.moduleId, moduleIds)}
                    disabled={block.course.isPassed}
                    isDraft={draftCourseIds.has(block.course.courseUnitId)}
                    className="z-10 min-h-[74px]"
                    onDismissValidationWarning={onDismissValidationWarning}
                    validationWarnings={validationWarnings.get(block.course.courseUnitId)}
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
