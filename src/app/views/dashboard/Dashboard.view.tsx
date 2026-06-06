import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DragDropProvider, type DragEndEvent, type DragMoveEvent } from '@dnd-kit/react';
import { AnimatePresence, motion } from 'motion/react';
import { fetchAttainments } from '@/app/api/endpoints/attainments';
import { fetchPlans } from '@/app/api/endpoints/plans';
import { getActiveCourses } from '@/app/api/dataPoints/getActiveCourses';
import { getCreditsByModule } from '@/app/api/dataPoints/getCreditsByModule';
import { getCreditsByPeriod, getCreditsBySemester } from '@/app/api/dataPoints/getCreditsByPeriod';
import { getDashboardStats } from '@/app/api/dataPoints/getDashboardStats';
import { getMoodleDeadlines } from '@/app/api/dataPoints/getMoodleDeadlines';
import { getStudyPeriodMap } from '@/app/api/dataPoints/getStudyPeriodMap';
import { getTimelineCourses } from '@/app/api/dataPoints/getTimelineCourses';
import { resolveCourseUnit } from '@/app/api/resolvers/resolveCourseUnit';
import { Button } from '@/app/components/ui/Button.comp';
import { InlineLoader } from '@/app/components/ui/InlineLoader.comp';
import { daysUntil } from '@/app/helpers/daysUntilToday';
import { useSisuQuery } from '@/app/hooks/useSisuQuery';
import { useChromeStorage } from '@/app/hooks/useChromeStorage';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { MODULE_COLOR_VALUES } from '@/app/theme/moduleColors';
import type { TFunction } from 'i18next';
import { DashboardGridIcon } from './components/icons/DashboardGridIcon.comp';
import { DashboardCell } from './components/DashboardCell.comp';
import { DashboardWidgetShell } from './components/DashboardWidgetShell.comp';
import { EmptyWidgetState } from './components/EmptyWidgetState.comp';
import { MoodleMissingToken } from './components/MoodleMissingToken.comp';
import { ActiveCoursesContent } from './components/ActiveCoursesContent.comp';
import { DegreeCompletionContent } from './components/DegreeCompletionContent.comp';
import { MoodleDeadlinesContent } from './components/MoodleDeadlinesContent.comp';
import { SemesterStatsContent } from './components/SemesterStatsContent.comp';
import { GradeTrendContent } from './components/GradeTrendContent.comp';
import { CreditsVelocityContent } from './components/CreditsVelocityContent.comp';
import { TimelinePeekContent } from './components/TimelinePeekContent.comp';
import { RecentAchievementsContent } from './components/RecentAchievementsContent.comp';
import { WorkloadForecastContent } from './components/WorkloadForecastContent.comp';
import { GraduationCountdownContent } from './components/GraduationCountdownContent.comp';
import {
  canPlaceDashboardWidget,
  clampWidgetLayout,
  DASHBOARD_COLUMNS,
  DASHBOARD_ROWS,
  type DashboardWidgetId,
  type DashboardWidgetLayout,
  findOpenDashboardSlot,
  getHiddenWidgets,
} from './util/widgetsHandlers';
import { isDashboardWidgetDragData } from './util/dndHandlers';
import { getCurrentPeriodLabel, getCurrentSemester } from './util/periodLabel';
import { formatStudyRightEnd, isCourseUnitAttainment, getGrade } from './util/attainmentHelpers';
import type { DashboardCompletedCourse } from './types/DashboardCompletedCourse.type';

interface DragTransform {
  x: number;
  y: number;
}

const renderHeader = (id: DashboardWidgetId, t: TFunction, missingToken: boolean): React.ReactNode => {
  const title = t(`widgets.titles.${id.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase())}`);
  if (id === 'moodle-deadlines') {
    return (
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-offwhite">{t('widgets.moodleDeadlines.title')}</span>
        {!missingToken && (
          <span className="rounded bg-danger/15 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-danger">
            {t('widgets.moodleDeadlines.live')}
          </span>
        )}
      </div>
    );
  }
  if (id === 'active-courses') {
    return (
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-offwhite">{t('widgets.activeCourses.title')}</span>
        <span className="flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
          {getCurrentSemester(t)}
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-offwhite">{title}</span>
    </div>
  );
};

const DashboardView: React.FC = () => {
  const { t } = useTranslationWithPrefix('views.dashboard');
  const [prefs, setPrefs, isPrefsLoaded] = useChromeStorage();
  const [isEditMode, setIsEditMode] = useState(false);
  const [layout, setLayout] = useState<DashboardWidgetLayout[]>(prefs.dashboardLayout);
  const [previewLayout, setPreviewLayout] = useState<DashboardWidgetLayout | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const { deadlines, deadlinesLoading, missingToken } = getMoodleDeadlines();
  const { creditsDone, gradeAverage, gradedCount, studyRightEndDate, isLoading: statsLoading } = getDashboardStats();
  const { activeCourses, isLoading: coursesLoading } = getActiveCourses();
  const { modules, totalTarget, isLoading: modulesLoading } = getCreditsByModule();
  const plansQuery = useSisuQuery(['plans'], fetchPlans);
  const selectedPlanId = plansQuery.data?.find((plan) => plan.primary)?.id ?? plansQuery.data?.[0]?.id;
  const { timelineCourses, isLoading: timelineLoading } = getTimelineCourses(selectedPlanId);
  const { studyPeriodMap, isLoading: periodsLoading } = getStudyPeriodMap();
  const completedCoursesQuery = useSisuQuery(['dashboard-completed-courses'], async () => {
    const attainments = (await fetchAttainments())
      .filter(isCourseUnitAttainment)
      .filter((attainment) => attainment.primary && attainment.state !== 'FAILED')
      .sort((a, b) => b.registrationDate.localeCompare(a.registrationDate));

    return Promise.all(
      attainments.map(async (attainment): Promise<DashboardCompletedCourse> => {
        const courseUnit = await resolveCourseUnit(attainment.courseUnitId);
        return {
          id: attainment.id ?? attainment.courseUnitId,
          courseUnitId: attainment.courseUnitId,
          name: courseUnit.name ?? courseUnit.code ?? t('courses.completedCourse'),
          code: courseUnit.code,
          credits: attainment.credits,
          grade: getGrade(attainment),
          registrationDate: attainment.registrationDate,
        };
      }),
    );
  });

  const studyRightEnd = formatStudyRightEnd(studyRightEndDate, t('studyRight.until'));
  const semesterCredits = activeCourses.reduce((s, c) => s + (c.credits ?? 0), 0);
  const moduleColorMap = new Map(
    modules.map((m, i) => [m.moduleId, MODULE_COLOR_VALUES[i % MODULE_COLOR_VALUES.length]]),
  );
  const moduleNameMap = new Map(modules.map((m) => [m.moduleId, m.name]));
  const moduleIds = useMemo(
    () => [
      ...new Set(
        timelineCourses.map((course) => course.moduleId).filter((moduleId): moduleId is string => moduleId != null),
      ),
    ],
    [timelineCourses],
  );
  const periodSummaries = useMemo(
    () => getCreditsByPeriod(timelineCourses, studyPeriodMap),
    [studyPeriodMap, timelineCourses],
  );
  const semesterSummaries = useMemo(() => getCreditsBySemester(periodSummaries), [periodSummaries]);
  const upcomingDeadlines = deadlines?.events
    ? Object.values(deadlines.events).filter((ev) => ev.end?.date && daysUntil(ev.end?.date) <= 5).length
    : 0;
  const hiddenWidgets = getHiddenWidgets(layout);
  const previewValid = previewLayout ? canPlaceDashboardWidget(layout, previewLayout, previewLayout.id) : false;

  useEffect(() => {
    if (isPrefsLoaded) setLayout(prefs.dashboardLayout);
  }, [isPrefsLoaded]);

  useEffect(() => {
    if (isPrefsLoaded) setPrefs({ dashboardLayout: layout });
  }, [layout, setPrefs, isPrefsLoaded]);

  const updateLayoutItem = (id: DashboardWidgetId, patch: Partial<DashboardWidgetLayout>): boolean => {
    const currentItem = layout.find((item) => item.id === id);
    if (!currentItem) return false;
    const candidate = clampWidgetLayout({ ...currentItem, ...patch });
    if (!canPlaceDashboardWidget(layout, candidate, id)) return false;
    setLayout((current) => current.map((item) => (item.id === id ? candidate : item)));
    return true;
  };

  const getGridStep = () => {
    const grid = gridRef.current;
    if (!grid) return null;
    const gridRect = grid.getBoundingClientRect();
    const gridStyles = window.getComputedStyle(grid);
    const columnGap = Number.parseFloat(gridStyles.columnGap || gridStyles.gap || '0') || 0;
    const rowGap = Number.parseFloat(gridStyles.rowGap || gridStyles.gap || '0') || 0;
    const columnWidth = (gridRect.width - columnGap * (DASHBOARD_COLUMNS - 1)) / DASHBOARD_COLUMNS;
    return { column: columnWidth + columnGap, row: 72 + rowGap };
  };

  const getDropCandidate = (sourceData: unknown, transform: DragTransform): DashboardWidgetLayout | null => {
    if (!isDashboardWidgetDragData(sourceData)) return null;
    const currentItem = layout.find((item) => item.id === sourceData.widgetId);
    if (!currentItem) return null;
    const gridStep = getGridStep();
    if (!gridStep) return null;
    return clampWidgetLayout({
      ...currentItem,
      x: currentItem.x + Math.round(transform.x / gridStep.column),
      y: currentItem.y + Math.round(transform.y / gridStep.row),
    });
  };

  const handleDragMove = (event: DragMoveEvent) => {
    setPreviewLayout(getDropCandidate(event.operation.source?.data, event.operation.transform));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setPreviewLayout(null);
    if (event.canceled) return;
    const candidate = getDropCandidate(event.operation.source?.data, event.operation.transform);
    const source = event.operation.source?.data;
    if (!candidate || !isDashboardWidgetDragData(source)) return;
    if (!canPlaceDashboardWidget(layout, candidate, source.widgetId)) return;
    updateLayoutItem(source.widgetId, { x: candidate.x, y: candidate.y });
  };

  const addWidget = (id: DashboardWidgetId) => {
    setLayout((current) => {
      const openSlot = findOpenDashboardSlot(current, id);
      return openSlot ? [...current, openSlot] : current;
    });
  };

  const removeWidget = (id: DashboardWidgetId) => {
    setLayout((current) => current.filter((item) => item.id !== id));
  };

  const renderWidget = (id: DashboardWidgetId): React.ReactNode => {
    switch (id) {
      case 'degree-completion':
        return statsLoading || modulesLoading ? (
          <InlineLoader />
        ) : (
          <DegreeCompletionContent
            creditsDone={creditsDone}
            gradedCount={gradedCount}
            gradeAverage={gradeAverage}
            modules={modules}
            studyRightEnd={studyRightEnd}
            totalTarget={totalTarget}
          />
        );
      case 'moodle-deadlines':
        if (deadlinesLoading) return <InlineLoader />;
        if (missingToken) return <MoodleMissingToken />;
        return <MoodleDeadlinesContent deadlines={deadlines} />;
      case 'active-courses':
        return coursesLoading ? (
          <InlineLoader />
        ) : (
          <ActiveCoursesContent
            activeCourses={activeCourses}
            moduleColorMap={moduleColorMap}
            moduleNameMap={moduleNameMap}
          />
        );
      case 'semester-stats':
        return statsLoading || coursesLoading ? (
          <InlineLoader />
        ) : (
          <SemesterStatsContent
            activeCoursesCount={activeCourses.length}
            semesterCredits={semesterCredits}
            upcomingDeadlines={upcomingDeadlines}
          />
        );
      case 'grade-trend':
        return completedCoursesQuery.isLoading ? (
          <InlineLoader />
        ) : (
          <GradeTrendContent courses={completedCoursesQuery.data ?? []} />
        );
      case 'credits-velocity':
        return timelineLoading || periodsLoading ? (
          <InlineLoader />
        ) : (
          <CreditsVelocityContent semesters={semesterSummaries} />
        );
      case 'timeline-peek':
        return timelineLoading || periodsLoading ? (
          <InlineLoader />
        ) : (
          <TimelinePeekContent moduleIds={moduleIds} periods={periodSummaries} />
        );
      case 'recent-achievements':
        return completedCoursesQuery.isLoading ? (
          <InlineLoader />
        ) : (
          <RecentAchievementsContent courses={completedCoursesQuery.data ?? []} />
        );
      case 'workload-forecast':
        return timelineLoading || periodsLoading ? (
          <InlineLoader />
        ) : (
          <WorkloadForecastContent periods={periodSummaries} />
        );
      case 'graduation-countdown':
        return statsLoading || modulesLoading || timelineLoading || periodsLoading ? (
          <InlineLoader />
        ) : (
          <GraduationCountdownContent
            creditsDone={creditsDone}
            semesters={semesterSummaries}
            totalTarget={totalTarget}
          />
        );
    }
  };

  return (
    <DragDropProvider onDragMove={handleDragMove} onDragEnd={handleDragEnd}>
      <div className="flex flex-col gap-5 pb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-balance text-offwhite">{t('title')}</h1>
            <p className="mt-0.5 text-sm text-balance text-lightGrey">{getCurrentPeriodLabel(t)}</p>
          </div>
          <Button
            icon={<DashboardGridIcon />}
            onClick={() => setIsEditMode((current) => !current)}
            variant={isEditMode ? 'accent' : 'primary'}
          >
            {isEditMode ? t('actions.done') : t('actions.customize')}
          </Button>
        </div>

        <div className="grid">
          <div
            ref={gridRef}
            className="grid w-full grid-cols-10 gap-4"
            style={{ gridTemplateRows: `repeat(${DASHBOARD_ROWS}, 72px)` }}
          >
            {Array.from({ length: DASHBOARD_ROWS }).flatMap((_, y) =>
              Array.from({ length: DASHBOARD_COLUMNS }).map((__, x) => (
                <DashboardCell
                  key={`${x}:${y}`}
                  isEditMode={isEditMode}
                  previewLayout={previewLayout}
                  previewValid={previewValid}
                  x={x}
                  y={y}
                />
              )),
            )}
            {layout.map((item) => (
              <DashboardWidgetShell
                key={item.id}
                header={renderHeader(item.id, t, missingToken ?? false)}
                isEditMode={isEditMode}
                item={item}
                onRemove={removeWidget}
                onResize={(id, delta) => updateLayoutItem(id, delta)}
              >
                {renderWidget(item.id)}
              </DashboardWidgetShell>
            ))}
          </div>
        </div>

        <AnimatePresence initial={false}>
          {isEditMode && (
            <motion.aside
              animate={{ x: 0, opacity: 1 }}
              className="fixed top-[41px] right-0 z-40 flex h-[calc(100dvh-41px)] w-[320px] flex-col border-l border-border bg-container px-4 py-5 shadow-[-18px_0_40px_rgba(0,0,0,0.28)]"
              exit={{ x: 28, opacity: 0 }}
              initial={{ x: 28, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.34, bounce: 0 }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-offwhite">{t('editor.libraryTitle')}</h2>
                  <p className="mt-1 text-sm text-lightGrey">{t('editor.libraryDescription')}</p>
                </div>
                <button
                  aria-label={t('widgets.actions.closeEditor')}
                  className="flex size-10 items-center justify-center rounded-lg bg-container2 text-lightGrey transition-[background-color,color,transform] duration-150 hover:bg-offwhite/10 hover:text-offwhite active:scale-[0.96]"
                  onClick={() => setIsEditMode(false)}
                  type="button"
                >
                  ×
                </button>
              </div>

              <div className="mt-5 flex flex-col gap-3 overflow-y-auto pr-1">
                {hiddenWidgets.map((widget) => {
                  const openSlot = findOpenDashboardSlot(layout, widget.id);
                  return (
                    <button
                      key={widget.id}
                      className={`group rounded-xl p-3 text-left shadow-[0_0_0_1px_rgba(255,255,255,0.04)] transition-[background-color,box-shadow,opacity,transform] duration-200 ${
                        openSlot
                          ? 'cursor-pointer bg-container2 hover:bg-offwhite/10 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.08)] active:scale-[0.96]'
                          : 'cursor-not-allowed bg-container2/50 opacity-50'
                      }`}
                      disabled={!openSlot}
                      onClick={() => addWidget(widget.id)}
                      type="button"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2 text-sm font-semibold text-offwhite">
                          {t(
                            `widgets.titles.${widget.id.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase())}`,
                          )}
                        </span>
                        <span className="rounded-full bg-background px-2 py-0.5 font-mono text-[10px] text-lightGrey">
                          {openSlot ? `${widget.size.w}x${widget.size.h}` : t('widgets.actions.noSpace')}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-lightGrey">
                        {t(
                          `widgets.descriptions.${widget.id.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase())}`,
                        )}
                      </p>
                    </button>
                  );
                })}
                {hiddenWidgets.length === 0 && <EmptyWidgetState label={t('editor.emptyLibrary')} />}
              </div>

              <div className="mt-auto rounded-xl bg-background/70 p-3 text-xs leading-relaxed text-lightGrey shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
                {t('editor.footerHint')}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </DragDropProvider>
  );
};

export default DashboardView;
