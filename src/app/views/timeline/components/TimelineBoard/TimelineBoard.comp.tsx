import React from 'react';
import { useDragOperation } from '@dnd-kit/react';
import { useGridFlip } from '@/app/views/timeline/hooks/useGridFlip';
import type { PeriodCreditSummary, SemesterCreditSummary } from '@/app/api/dataPoints/getCreditsByPeriod';
import type { TimelineCourse } from '@/app/api/dataPoints/getTimelineCourses';
import { DraggableTimelineCourseCard } from '@/app/views/timeline/components/DraggableTimelineCourseCard.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { sortCourses } from '@/app/views/timeline/util/sortCourses';
import { PeriodDropCell } from '@/app/views/timeline/components/TimelineBoard/components/PeriodDropCell.comp';
import { BoardSemesterHeader } from '@/app/views/timeline/components/TimelineBoard/components/BoardSemesterHeader.comp';
import { BoardPeriodHeader } from '@/app/views/timeline/components/TimelineBoard/components/BoardPeriodHeader.comp';
import { getCourseLocators, getResizedLocators } from '@/app/views/timeline/util/courseLocators';
import { TimelineValidationWarning } from '@/app/views/timeline/util/timelineValidation';
import { getCourseKey } from '@/app/views/timeline/util/getCourseKey';
import { getModuleColor } from '@/app/theme/moduleColors';
import type { TimelineCourseDragData, TimelinePeriodDropData } from '@/app/views/timeline/util/dndHandlers';

interface Props {
  draftCourseIds?: Set<string>;
  highlightedPeriodLocators?: Set<string>;
  isDragging?: boolean;
  onDismissValidationWarning?: (warningId: string) => void;
  onResizeCourse?: (courseUnitId: string, newPeriodLocators: string[]) => void;
  scrollRef?: React.Ref<HTMLDivElement>;
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
  scrollRef,
  semesters,
  validationWarnings = new Map(),
}) => {
  const { t } = useTranslationWithPrefix('views.timeline');
  const visiblePeriods = semesters.flatMap((semester) => semester.periods.map((period) => ({ period, semester })));
  const courseBlocks = getCourseBlocks(semesters, visiblePeriods);
  const rowCount = Math.max(courseBlocks.length > 0 ? Math.max(...courseBlocks.map((block) => block.row)) + 1 : 1, 3);
  const columnWidth = `${PERIOD_WIDTH}px`;
  const gridTemplateColumns = visiblePeriods.map(() => columnWidth).join(' ');
  const visibleLocators = visiblePeriods.map(({ period }) => period.periodLocator);
  const maxPeriodCredits = Math.max(0, ...visiblePeriods.map(({ period }) => getTotalCredits(period)));
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
    <div ref={scrollRef} className="min-h-0 min-w-0 flex-1 overflow-auto">
      <div className="min-h-full w-max px-4 py-5">
        {semesters.length > 0 ? (
          <div ref={flipRef}>
            <div className="grid gap-2" style={{ gridTemplateColumns }}>
              {semesters.map((semester) => {
                const startColumn = periodOffset + 1;
                periodOffset += semester.periods.length;
                return (
                  <BoardSemesterHeader
                    key={`${semester.studyYear}:${semester.termName}`}
                    semester={semester}
                    startColumn={startColumn}
                  />
                );
              })}
            </div>

            <div className="mt-2 grid gap-2" style={{ gridTemplateColumns }}>
              {visiblePeriods.map(({ period }) => (
                <BoardPeriodHeader
                  key={period.periodLocator}
                  period={period}
                  loadShare={maxPeriodCredits > 0 ? getTotalCredits(period) / maxPeriodCredits : 0}
                />
              ))}
            </div>

            <div
              className="mt-2 grid gap-2"
              style={{
                gridTemplateColumns,
                gridTemplateRows: `repeat(${rowCount}, minmax(52px, auto))`,
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
                      disabled={block.course.isPassed}
                      isDraft={draftCourseIds.has(block.course.courseUnitId)}
                      className="h-full min-h-13"
                      onDismissValidationWarning={onDismissValidationWarning}
                      validationWarnings={validationWarnings.get(block.course.courseUnitId)}
                      onResizeRight={(delta) => {
                        if (!onResizeCourse) return;
                        const newLocators = getResizedLocators(getCourseLocators(block.course), visibleLocators, delta);
                        if (newLocators) onResizeCourse(block.course.courseUnitId, newLocators);
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
    </div>
  );
};
