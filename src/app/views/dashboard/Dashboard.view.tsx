import React, { useEffect, useRef, useState } from 'react';
import { DragDropProvider, type DragEndEvent, type DragMoveEvent } from '@dnd-kit/react';
import { useReducedMotion } from 'motion/react';
import { useNavigate } from 'react-router';
import { useChromeStorage } from '@/app/hooks/useChromeStorage';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { DashboardGridIcon } from './components/icons/DashboardGridIcon.comp';
import { DashboardHero } from './components/hero/DashboardHero.comp';
import { DashboardControlButton } from './components/DashboardControlButton.comp';
import { DashboardCell } from './components/DashboardCell.comp';
import { isDashboardWidgetDragData } from './util/dndHandlers';
import { formatStudyRightEnd } from './util/attainmentHelpers';
import { WidgetIcon } from '@/app/views/dashboard/components/widget/WidgetIcon.comp';
import { DashboardWidgetShell } from '@/app/views/dashboard/components/widget/DashboardWidgetShell.comp';
import { WidgetDrawer } from '@/app/views/dashboard/components/WidgetDrawer.comp';
import { WIDGET_META } from '@/app/views/dashboard/constants/WidgetMeta.const';
import { useDashboardData } from './hooks/useDashboardData';
import { renderWidgetContent, WidgetContentContext } from './util/renderWidgetContent';
import {
  canPlaceDashboardWidget,
  clampWidgetLayout,
  getWidgetBadge,
  sanitizeDashboardLayout,
  WidgetBadgeContext,
} from '@/app/views/dashboard/util';
import { DashboardWidgetId, DashboardWidgetLayout } from '@/app/views/dashboard/types';
import { DASHBOARD_COLUMNS, DASHBOARD_ROWS } from '@/app/views/dashboard/constants/widgetDefinitions.const';

interface DragTransform {
  x: number;
  y: number;
}

const DashboardView: React.FC = () => {
  const { t } = useTranslationWithPrefix('views.dashboard');
  const shouldReduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const [prefs, setPrefs, isPrefsLoaded] = useChromeStorage();
  const [isEditMode, setIsEditMode] = useState(false);
  const [layout, setLayout] = useState<DashboardWidgetLayout[]>(sanitizeDashboardLayout(prefs.dashboardLayout));
  const [previewLayout, setPreviewLayout] = useState<DashboardWidgetLayout | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const {
    activeCourses,
    completedCourses,
    completedCoursesLoading,
    coursesLoading,
    creditsDone,
    deadlines,
    deadlinesLoading,
    gradeAverage,
    gradedCount,
    missingToken,
    moduleColorMap,
    moduleNameMap,
    modules,
    modulesLoading,
    periodsLoading,
    periodSummaries,
    registrationCourses,
    registrationCoursesLoading,
    selectedPlanId,
    semesterCredits,
    semesterSummaries,
    statsLoading,
    studyRightEndDate,
    timelineCourses,
    timelineLoading,
    totalTarget,
    upcomingDeadlines,
  } = useDashboardData();

  const widgetContentCtx: WidgetContentContext = {
    activeCourses,
    completedCourses,
    completedCoursesLoading,
    coursesLoading,
    creditsDone,
    deadlines,
    deadlinesLoading,
    missingToken,
    moduleColorMap,
    moduleNameMap,
    modules,
    modulesLoading,
    periodsLoading,
    periodSummaries,
    registrationCourses,
    registrationCoursesLoading,
    semesterCredits,
    semesterSummaries,
    statsLoading,
    studyRightEndDate,
    timelineCourses,
    timelineLoading,
    totalTarget,
    upcomingDeadlines,
  };
  const widgetBadgeCtx: WidgetBadgeContext = {
    t,
    navigate,
    selectedPlanId,
    missingToken,
    registrationCourses,
    completedCourses,
  };

  const previewValid = previewLayout ? canPlaceDashboardWidget(layout, previewLayout, previewLayout.id) : false;
  const studyRightEnd = formatStudyRightEnd(studyRightEndDate, t('studyRight.until'));

  useEffect(() => {
    if (isPrefsLoaded) setLayout(sanitizeDashboardLayout(prefs.dashboardLayout));
  }, [isPrefsLoaded]);

  useEffect(() => {
    if (isPrefsLoaded) setPrefs({ dashboardLayout: sanitizeDashboardLayout(layout) });
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

  const removeWidget = (id: DashboardWidgetId) => {
    setLayout((current) => current.filter((item) => item.id !== id));
  };

  return (
    <DragDropProvider onDragMove={handleDragMove} onDragEnd={handleDragEnd}>
      <div className="mx-auto flex w-full flex-col gap-5 pb-8">
        <DashboardHero
          activeCoursesCount={activeCourses.length}
          completedCourses={completedCourses}
          creditsDone={creditsDone}
          deadlines={deadlines}
          gradeAverage={gradeAverage}
          gradedCount={gradedCount}
          registrationCourses={registrationCourses}
          semesters={semesterSummaries}
          studyRightEnd={studyRightEnd}
          totalTarget={totalTarget}
          upcomingDeadlines={upcomingDeadlines}
        />

        <div className="flex justify-center">
          <div className="relative w-full">
            <div className="absolute top-0 right-0 z-30">
              <DashboardControlButton
                active={isEditMode}
                ariaLabel={isEditMode ? t('actions.done') : t('actions.customize')}
                onClick={() => setIsEditMode((current) => !current)}
                tooltip={isEditMode ? t('actions.done') : t('actions.customize')}
                tooltipSide="bottom"
              >
                <DashboardGridIcon />
              </DashboardControlButton>
            </div>

            <div
              ref={gridRef}
              className="mx-auto grid w-full max-w-7xl grid-cols-10 gap-4"
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
              {layout.map((item) => {
                const meta = WIDGET_META[item.id];
                return (
                  <DashboardWidgetShell
                    key={item.id}
                    icon={<WidgetIcon name={meta.icon} />}
                    eyebrow={t(`widgets.eyebrows.${meta.eyebrowKey}`)}
                    badge={getWidgetBadge(item.id, widgetBadgeCtx)}
                    isEditMode={isEditMode}
                    item={item}
                    onRemove={removeWidget}
                    onResize={(id, delta) => updateLayoutItem(id, delta)}
                    shouldReduceMotion={shouldReduceMotion}
                  >
                    {renderWidgetContent(item.id, widgetContentCtx)}
                  </DashboardWidgetShell>
                );
              })}
            </div>
          </div>
        </div>

        <WidgetDrawer
          setLayout={setLayout}
          setIsEditMode={setIsEditMode}
          shouldReduceMotion={shouldReduceMotion}
          isEditMode={isEditMode}
          layout={layout}
        />
      </div>
    </DragDropProvider>
  );
};

export default DashboardView;
