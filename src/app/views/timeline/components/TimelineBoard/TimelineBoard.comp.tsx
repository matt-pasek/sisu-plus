import React from 'react';
import { useDragOperation } from '@dnd-kit/react';
import { useGridFlip } from '@/app/views/timeline/hooks/useGridFlip';
import type { PeriodCreditSummary, SemesterCreditSummary } from '@/app/api/dataPoints/getCreditsByPeriod';
import type { TimelineCourse } from '@/app/api/dataPoints/getTimelineCourses';
import { DraggableTimelineCourseCard } from '@/app/views/timeline/components/DraggableTimelineCourseCard.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { sortCourses } from '@/app/views/timeline/util/sortCourses';
import { PeriodDropCell } from '@/app/views/timeline/components/TimelineBoard/components/PeriodDropCell.comp';
import { CreditChip } from '@/app/views/timeline/components/TimelineBoard/components/CreditChip.comp';
import { formatCredits } from '@/app/helpers/formatCredits';
import { TimelineValidationWarning } from '@/app/views/timeline/util/timelineValidation';
import { getCourseKey } from '@/app/views/timeline/util/getCourseKey';
import { isCurrentPeriod, isCurrentSemester } from '@/app/views/timeline/util/getVisibleSemesters';
import { formatPeriodRange } from '@/app/views/timeline/util/formatPeriodRange';
import { getSemesterTitle } from '@/app/helpers/getSemesterTitle';
import { getModuleColor } from '@/app/theme/moduleColors';
import type { TimelineCourseDragData, TimelinePeriodDropData } from '@/app/views/timeline/util/dndHandlers';

interface Props {
  draftCourseIds?: Set<string>;
  highlightedPeriodLocators?: Set<string>;
  isDragging?: boolean;
  onDismissValidationWarning?: (warningId: string) => void;
  onResizeCourse?: (courseUnitId: string, newPeriodLocators: string[]) => void;
  semesters: SemesterCreditSummary[];
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

interface CourseSpan {
  course: TimelineCourse;
  startColumn: number;
  endColumn: number;
}

const PERIOD_WIDTH = 210;

function getTotalCredits(
  summary: Pick<PeriodCreditSummary | SemesterCreditSummary, 'plannedCredits' | 'completedCredits'>,
): number {
  return summary.plannedCredits + summary.completedCredits;
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

  const sortedCourses = sortCourses([...uniqueCourses.values()]);
  const courseSortOrder = new Map(sortedCourses.map((course, index) => [getCourseKey(course), index]));
  const courseSpans: CourseSpan[] = sortedCourses.flatMap((course) => {
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
    return [{ course, startColumn, endColumn }];
  });

  return courseSpans
    .sort((a, b) => {
      if (a.startColumn !== b.startColumn) return a.startColumn - b.startColumn;

      const aSpan = a.endColumn - a.startColumn;
      const bSpan = b.endColumn - b.startColumn;
      if (aSpan !== bSpan) return bSpan - aSpan;

      return (courseSortOrder.get(getCourseKey(a.course)) ?? 0) - (courseSortOrder.get(getCourseKey(b.course)) ?? 0);
    })
    .map((courseSpan) => {
      const row = rowEndColumns.findIndex((endColumnForRow) => courseSpan.startColumn >= endColumnForRow);

      if (row >= 0) {
        rowEndColumns[row] = courseSpan.endColumn;
        return { ...courseSpan, row };
      }

      rowEndColumns.push(courseSpan.endColumn);
      return { ...courseSpan, row: rowEndColumns.length - 1 };
    });
}

export const TimelineBoard: React.FC<Props> = ({
  draftCourseIds = new Set(),
  highlightedPeriodLocators = new Set(),
  isDragging = false,
  onDismissValidationWarning,
  onResizeCourse,
  semesters,
  validationWarnings = new Map(),
}) => {
  const { t } = useTranslationWithPrefix('views.timeline');
  const visiblePeriods = semesters.flatMap((semester) => semester.periods.map((period) => ({ period, semester })));
  const courseBlocks = getCourseBlocks(semesters, visiblePeriods);
  const rowCount = Math.max(courseBlocks.length > 0 ? Math.max(...courseBlocks.map((block) => block.row)) + 1 : 1, 3);
  const columnWidth = `${PERIOD_WIDTH}px`;
  const gridTemplateColumns = visiblePeriods.map(() => columnWidth).join(' ');
  const hasHighlightedDropPeriods = highlightedPeriodLocators.size > 0;
  const flipKey = visiblePeriods.map(({ period }) => period.periodLocator).join(':');
  const flipRef = useGridFlip<HTMLDivElement>(flipKey);
  const dragOperation = useDragOperation();
  const sourceData = dragOperation.source?.data as TimelineCourseDragData | undefined;
  const targetData = dragOperation.target?.data as TimelinePeriodDropData | undefined;

  const activeDropLocators = new Set<string>();
  if (targetData?.kind === 'timeline-period' && sourceData?.kind === 'timeline-course') {
    const targetIndex = visiblePeriods.findIndex((p) => p.period.periodLocator === targetData.periodLocator);
    if (targetIndex !== -1) {
      const count = sourceData.periodCount || 1;
      for (let i = 0; i < count; i++) {
        const p = visiblePeriods[targetIndex + i];
        if (p) activeDropLocators.add(p.period.periodLocator);
      }
    }
  }

  let periodOffset = 0;

  return (
    <main className="min-w-0 flex-1 overflow-auto bg-background">
      <div className="min-h-full w-max py-5">
        {semesters.length > 0 ? (
          <div ref={flipRef}>
            <div className="grid gap-2" style={{ gridTemplateColumns }}>
              {semesters.map((semester) => {
                const startColumn = periodOffset + 1;
                const isCompactSemesterHeader = semester.periods.length === 1;
                periodOffset += semester.periods.length;

                return (
                  <div
                    key={`${semester.studyYear}:${semester.termName}`}
                    data-flip-id={`semester:${semester.studyYear}:${semester.termName}`}
                    className={`overflow-hidden rounded-lg border px-4 py-2 ${
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
                          <CreditChip label={t('board.done')} credits={semester.completedCredits} variant="completed" />
                        )}
                        {semester.plannedCredits > 0 && (
                          <CreditChip
                            label={t('board.planned')}
                            credits={semester.plannedCredits}
                            hideLabel={isCompactSemesterHeader}
                            variant="planned"
                          />
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
                  title={t('board.workloadTitle', {
                    period: period.period.name,
                    credits: formatCredits(getTotalCredits(period)),
                  })}
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
                  isActiveDropTarget={activeDropLocators.has(period.periodLocator)}
                  period={period}
                  rowCount={rowCount}
                />
              ))}

              {courseBlocks.length > 0 ? (
                courseBlocks.map((block) => (
                  <div
                    key={getCourseKey(block.course)}
                    data-flip-id={`course:${getCourseKey(block.course)}`}
                    className="z-10"
                    style={{
                      gridColumn: `${block.startColumn + 1} / ${block.endColumn + 1}`,
                      gridRow: block.row + 1,
                    }}
                  >
                    <DraggableTimelineCourseCard
                      style={{
                        height: '100%',
                      }}
                      course={block.course}
                      color={getModuleColor(block.course.moduleId)}
                      compact={
                        block.endColumn - block.startColumn <= 1 ||
                        courseBlocks.some(
                          (otherBlock) =>
                            otherBlock.course.courseUnitId !== block.course.courseUnitId &&
                            otherBlock.row === block.row &&
                            ((otherBlock.startColumn >= block.startColumn &&
                              otherBlock.startColumn < block.endColumn) ||
                              (otherBlock.endColumn > block.startColumn && otherBlock.endColumn <= block.endColumn)),
                        )
                      }
                      disabled={block.course.isPassed}
                      isDraft={draftCourseIds.has(block.course.courseUnitId)}
                      className="h-full min-h-18.5"
                      onDismissValidationWarning={onDismissValidationWarning}
                      validationWarnings={validationWarnings.get(block.course.courseUnitId)}
                      onResizeRight={(delta) => {
                        if (!onResizeCourse) return;
                        const currentPeriodLocators = block.course.plannedPeriods.map((p) => p.locator);
                        if (currentPeriodLocators.length === 0) return;

                        const startLocator = currentPeriodLocators[0];
                        const startIndex = visiblePeriods.findIndex((p) => p.period.periodLocator === startLocator);
                        if (startIndex === -1) return;

                        const newLength = Math.max(1, currentPeriodLocators.length + delta);
                        const newPeriodLocators: string[] = [];

                        for (let i = 0; i < newLength; i++) {
                          const p = visiblePeriods[startIndex + i];
                          if (p) newPeriodLocators.push(p.period.periodLocator);
                        }

                        onResizeCourse(block.course.courseUnitId, newPeriodLocators);
                      }}
                    />
                  </div>
                ))
              ) : (
                <div
                  className="z-10 flex items-center justify-center text-xs text-darkishGrey"
                  style={{ gridColumn: '1 / -1' }}
                >
                  {t('board.noCourses')}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex h-64 w-[70vw] items-center justify-center rounded-xl border border-dashed border-border text-sm text-lightGrey">
            {t('board.noPeriods')}
          </div>
        )}
      </div>
    </main>
  );
};
