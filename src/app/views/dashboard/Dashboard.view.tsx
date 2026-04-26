import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DragDropProvider, useDraggable, useDroppable, type DragEndEvent, type DragMoveEvent } from '@dnd-kit/react';
import { AnimatePresence, motion, useAnimationControls } from 'motion/react';
import { fetchAttainments, type Attainment } from '@/app/api/endpoints/attainments';
import { fetchPlans } from '@/app/api/endpoints/plans';
import { getActiveCourses } from '@/app/api/dataPoints/getActiveCourses';
import { getCreditsByModule } from '@/app/api/dataPoints/getCreditsByModule';
import { getCreditsByPeriod, getCreditsBySemester } from '@/app/api/dataPoints/getCreditsByPeriod';
import { getDashboardStats } from '@/app/api/dataPoints/getDashboardStats';
import { getMoodleDeadlines } from '@/app/api/dataPoints/getMoodleDeadlines';
import { getStudyPeriodMap } from '@/app/api/dataPoints/getStudyPeriodMap';
import { getTimelineCourses } from '@/app/api/dataPoints/getTimelineCourses';
import type { CourseUnitAttainmentRestricted } from '@/app/api/generated/OriApi';
import { resolveCourseUnit } from '@/app/api/resolvers/resolveCourseUnit';
import { Button } from '@/app/components/ui/Button.comp';
import { InlineLoader } from '@/app/components/ui/InlineLoader.comp';
import { daysUntil } from '@/app/helpers/daysUntilToday';
import { useSisuQuery } from '@/app/hooks/useSisuQuery';
import {
  CreditsVelocityContent,
  DashboardCompletedCourse,
  GradeTrendContent,
  GraduationCountdownContent,
  RecentAchievementsContent,
  TimelinePeekContent,
  WorkloadForecastContent,
} from '@/app/views/dashboard/components/DashboardAnalyticsContent.comp';
import { ActiveCoursesContent } from '@/app/views/dashboard/components/ActiveCoursesContent.comp';
import { BAR_COLORS, DegreeCompletionContent } from '@/app/views/dashboard/components/DegreeCompletionContent.comp';
import { MoodleDeadlinesContent } from '@/app/views/dashboard/components/MoodleDeadlinesContent.comp';
import { SemesterStatsContent } from '@/app/views/dashboard/components/SemesterStatsContent.comp';
import { Widget } from '@/app/views/dashboard/components/Widget.comp';
import {
  DASHBOARD_COLUMNS,
  DASHBOARD_ROWS,
  DashboardWidgetId,
  DashboardWidgetLayout,
  canPlaceDashboardWidget,
  clampWidgetLayout,
  findOpenDashboardSlot,
  getHiddenWidgets,
  getWidgetDefinition,
} from '@/app/views/dashboard/components/dashboardWidgets';
import {
  DASHBOARD_WIDGET_DRAG_TYPE,
  getDashboardWidgetDragData,
  isDashboardWidgetDragData,
} from '@/app/views/dashboard/components/dashboardDnd';
import { useChromeStorage } from '@/app/hooks/useChromeStorage';

function getCurrentPeriodLabel(): string {
  const m = new Date().getMonth() + 1;
  const y = new Date().getFullYear();
  if (m >= 9) return `Autumn ${y} · ${m >= 11 ? '2nd' : '1st'} Period ongoing`;
  if (m >= 6) return `Summer ${y}`;
  if (m >= 3) return `Spring ${y} · 4th Period ongoing`;
  return `Spring ${y} · 3rd Period ongoing`;
}

function getCurrentSemester(): string {
  const m = new Date().getMonth() + 1;
  const y = new Date().getFullYear();
  if (m >= 9) return `Autumn ${y}`;
  if (m >= 6) return `Summer ${y}`;
  return `Spring ${y}`;
}

function formatStudyRightEnd(endDate: string | null): { year: string; until: string } | null {
  if (!endDate) return null;
  const d = new Date(endDate);
  d.setDate(d.getDate() - 1);
  return {
    year: d.getFullYear().toString(),
    until: `until ${d.toLocaleString('en-US', { month: 'long' })}`,
  };
}

function isCourseUnitAttainment(attainment: Attainment): attainment is CourseUnitAttainmentRestricted {
  return attainment.type === 'CourseUnitAttainment';
}

function getGrade(attainment: CourseUnitAttainmentRestricted): number | string | null {
  if (attainment.gradeScaleId.includes('hyl-hyv')) return attainment.gradeId != null ? 'Pass' : null;
  return attainment.gradeId >= 1 && attainment.gradeId <= 5 ? attainment.gradeId : null;
}

function getWidgetIcon(id: DashboardWidgetId): JSX.Element {
  const paths: Record<DashboardWidgetId, string> = {
    'degree-completion': 'M12 3.75 3.75 12 12 20.25 20.25 12 12 3.75Zm0 3 5.25 5.25L12 17.25 6.75 12 12 6.75Z',
    'active-courses': 'M4.5 6.75h15M4.5 12h15M4.5 17.25h15',
    'moodle-deadlines': 'M6.75 3.75h10.5v16.5H6.75V3.75Zm2.25 4.5h6M9 12h6M9 15.75h3',
    'semester-stats': 'M4.5 19.5V12m7.5 7.5V4.5m7.5 15v-10',
    'grade-trend': 'm4.5 16.5 4.5-5.25 4.5 2.25 6-7.5',
    'credits-velocity': 'M4.5 7.5h9M4.5 12h15M4.5 16.5h12',
    'timeline-peek': 'M6 4.5v15m6-15v15m6-15v15',
    'recent-achievements': 'M12 4.5 14.1 9l4.9.75-3.55 3.45.85 4.8L12 15.75 7.7 18l.85-4.8L5 9.75 9.9 9 12 4.5Z',
    'workload-forecast': 'M4.5 18.75 9 12l3 3 7.5-9.75',
    'graduation-countdown': 'M12 6v6l3 2.25M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z',
  };

  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
      <path d={paths[id]} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function getDashboardGridIcon(): JSX.Element {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const DashboardCell: React.FC<{
  previewLayout: DashboardWidgetLayout | null;
  previewValid: boolean;
  x: number;
  y: number;
  isEditMode: boolean;
}> = ({ previewLayout, previewValid, x, y, isEditMode }) => {
  const { ref, isDropTarget } = useDroppable({
    id: `dashboard-cell:${x}:${y}`,
    accept: DASHBOARD_WIDGET_DRAG_TYPE,
    data: { kind: 'dashboard-cell', x, y },
  });
  const isInPreview =
    previewLayout != null &&
    x >= previewLayout.x &&
    x < previewLayout.x + previewLayout.w &&
    y >= previewLayout.y &&
    y < previewLayout.y + previewLayout.h;

  return (
    <div
      ref={ref}
      className={`rounded-lg border border-dashed transition-[border-color,background-color,box-shadow,opacity] duration-200 ${
        isInPreview
          ? previewValid
            ? 'border-accent/80 bg-accent/15 shadow-[inset_0_0_18px_rgba(65,150,72,0.1)]'
            : 'border-danger/80 bg-danger/10 shadow-[inset_0_0_18px_rgba(240,107,107,0.1)]'
          : isDropTarget
            ? 'border-accent bg-accent/10 shadow-[inset_0_0_18px_rgba(65,150,72,0.08)]'
            : isEditMode
              ? 'border-border/55 bg-container/15'
              : 'pointer-events-none border-transparent opacity-0'
      }`}
      style={{ gridColumn: x + 1, gridRow: y + 1 }}
    />
  );
};

interface DashboardWidgetShellProps {
  children: React.ReactNode;
  header: React.ReactNode;
  isEditMode: boolean;
  item: DashboardWidgetLayout;
  onRemove: (id: DashboardWidgetId) => void;
  onResize: (id: DashboardWidgetId, delta: Partial<Pick<DashboardWidgetLayout, 'w' | 'h'>>) => boolean;
}

type ResizeAxis = 'x' | 'y' | 'both';

function getResizeBlockedMotion(axis: ResizeAxis) {
  const offset = 5;
  return {
    x: axis === 'y' ? undefined : [0, offset, -offset, offset / 2, 0],
    y: axis === 'x' ? undefined : [0, offset, -offset, offset / 2, 0],
    transition: { duration: 0.22, ease: 'easeOut' as const },
  };
}

const DashboardWidgetShell: React.FC<DashboardWidgetShellProps> = ({
  children,
  header,
  isEditMode,
  item,
  onRemove,
  onResize,
}) => {
  const { ref, isDragging } = useDraggable({
    id: `dashboard-widget:${item.id}`,
    type: DASHBOARD_WIDGET_DRAG_TYPE,
    data: getDashboardWidgetDragData(item.id),
    disabled: !isEditMode,
  });
  const definition = getWidgetDefinition(item.id);
  const blockedResizeControls = useAnimationControls();
  const animateResizeBlocked = (axis: ResizeAxis) => {
    void blockedResizeControls.start(getResizeBlockedMotion(axis));
  };
  const applyResize = (axis: ResizeAxis, patch: Partial<Pick<DashboardWidgetLayout, 'w' | 'h'>>) => {
    const accepted = onResize(item.id, patch);
    if (!accepted) animateResizeBlocked(axis);
  };
  const startResizeDrag =
    (axis: ResizeAxis): React.PointerEventHandler<HTMLButtonElement> =>
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.currentTarget.setPointerCapture(event.pointerId);

      const shell = event.currentTarget.closest('[data-dashboard-widget-shell]');
      const grid = shell?.parentElement;
      if (!grid) return;

      const gridRect = grid.getBoundingClientRect();
      const gridStyles = window.getComputedStyle(grid);
      const columnGap = Number.parseFloat(gridStyles.columnGap || gridStyles.gap || '0') || 0;
      const rowGap = Number.parseFloat(gridStyles.rowGap || gridStyles.gap || '0') || 0;
      const columnStep = (gridRect.width - columnGap * (DASHBOARD_COLUMNS - 1)) / DASHBOARD_COLUMNS + columnGap;
      const rowStep = 72 + rowGap;
      const startX = event.clientX;
      const startY = event.clientY;
      const startItem = item;
      let lastColumns = 0;
      let lastRows = 0;

      const handleMove = (moveEvent: PointerEvent) => {
        const columnDelta = axis === 'y' ? 0 : Math.round((moveEvent.clientX - startX) / columnStep);
        const rowDelta = axis === 'x' ? 0 : Math.round((moveEvent.clientY - startY) / rowStep);
        if (columnDelta === lastColumns && rowDelta === lastRows) return;

        lastColumns = columnDelta;
        lastRows = rowDelta;

        const patch: Partial<Pick<DashboardWidgetLayout, 'w' | 'h'>> = {};
        if (axis !== 'y') patch.w = startItem.w + columnDelta;
        if (axis !== 'x') patch.h = startItem.h + rowDelta;
        applyResize(axis, patch);
      };

      const handleUp = () => {
        window.removeEventListener('pointermove', handleMove);
        window.removeEventListener('pointerup', handleUp);
        window.removeEventListener('pointercancel', handleUp);
      };

      window.addEventListener('pointermove', handleMove);
      window.addEventListener('pointerup', handleUp);
      window.addEventListener('pointercancel', handleUp);
    };
  const editActions = isEditMode ? (
    <div className="flex items-center gap-1.5">
      <button
        aria-label={`Shrink ${definition.title}`}
        className="flex size-9 items-center justify-center rounded-lg bg-container2 text-lightGrey transition-[background-color,color,transform] duration-150 hover:bg-offwhite/10 hover:text-offwhite active:scale-[0.96]"
        onClick={() => applyResize('both', { w: item.w - 1, h: item.h - 1 })}
        onPointerDown={(event) => event.stopPropagation()}
        type="button"
      >
        -
      </button>
      <button
        aria-label={`Grow ${definition.title}`}
        className="flex size-9 items-center justify-center rounded-lg bg-container2 text-lightGrey transition-[background-color,color,transform] duration-150 hover:bg-offwhite/10 hover:text-offwhite active:scale-[0.96]"
        onClick={() => applyResize('both', { w: item.w + 1, h: item.h + 1 })}
        onPointerDown={(event) => event.stopPropagation()}
        type="button"
      >
        +
      </button>
      <button
        aria-label={`Remove ${definition.title}`}
        className="flex size-9 items-center justify-center rounded-lg bg-danger/15 text-danger transition-[background-color,transform] duration-150 hover:bg-danger/25 active:scale-[0.96]"
        onClick={() => onRemove(item.id)}
        onPointerDown={(event) => event.stopPropagation()}
        type="button"
      >
        x
      </button>
    </div>
  ) : null;

  return (
    <motion.div
      layout
      initial={false}
      ref={ref}
      animate={blockedResizeControls}
      data-dashboard-widget-shell
      transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
      className={`relative min-h-0 transition-[opacity,scale,filter] duration-200 ${
        isEditMode ? 'cursor-grab touch-none active:scale-[0.96] active:cursor-grabbing' : ''
      } ${isDragging ? 'z-30 scale-[1.02] opacity-45' : 'z-10'}`}
      style={{
        gridColumn: `${item.x + 1} / span ${item.w}`,
        gridRow: `${item.y + 1} / span ${item.h}`,
      }}
    >
      <Widget actions={editActions} header={header} loading={false}>
        {children}
      </Widget>

      <AnimatePresence initial={false}>
        {isEditMode && (
          <>
            <motion.div
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              className="absolute -right-2 -bottom-2 z-20 rounded-full bg-accent/90 px-2.5 py-1 font-mono text-[10px] font-semibold text-offwhite shadow-[0_8px_20px_rgba(0,0,0,0.35)]"
              exit={{ opacity: 0, scale: 0.96, filter: 'blur(4px)' }}
              initial={{ opacity: 0, scale: 0.96, filter: 'blur(4px)' }}
              transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
            >
              {item.w}x{item.h}
            </motion.div>
            <motion.div
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              className="pointer-events-none absolute inset-0 rounded-2xl border border-accent/45 bg-background/10 shadow-[0_0_0_1px_rgba(65,150,72,0.18),0_14px_38px_rgba(0,0,0,0.32)]"
              exit={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
              initial={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
              transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
            />
            <button
              aria-label={`Resize ${definition.title} horizontally`}
              className="absolute top-14 -right-2 bottom-10 z-20 w-4 cursor-ew-resize rounded-full transition-[background-color,opacity] duration-150 hover:bg-accent/25"
              onPointerDown={startResizeDrag('x')}
              type="button"
            />
            <button
              aria-label={`Resize ${definition.title} vertically`}
              className="absolute right-10 -bottom-2 left-10 z-20 h-4 cursor-ns-resize rounded-full transition-[background-color,opacity] duration-150 hover:bg-accent/25"
              onPointerDown={startResizeDrag('y')}
              type="button"
            />
            <button
              aria-label={`Resize ${definition.title}`}
              className="absolute -right-2 -bottom-2 z-30 size-7 cursor-nwse-resize rounded-full border border-accent/50 bg-accent/25 shadow-[0_8px_20px_rgba(0,0,0,0.35)] transition-[background-color,scale] duration-150 hover:bg-accent/40 active:scale-[0.96]"
              onPointerDown={startResizeDrag('both')}
              type="button"
            />
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const EmptyWidgetState: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border text-sm text-lightGrey">
    {label}
  </div>
);

interface DragTransform {
  x: number;
  y: number;
}

const DashboardView: React.FC = () => {
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
          name: courseUnit.name ?? courseUnit.code ?? 'Completed course',
          code: courseUnit.code,
          credits: attainment.credits,
          grade: getGrade(attainment),
          registrationDate: attainment.registrationDate,
        };
      }),
    );
  });
  const studyRightEnd = formatStudyRightEnd(studyRightEndDate);
  const semesterCredits = activeCourses.reduce((s, c) => s + (c.credits ?? 0), 0);
  const moduleColorMap = new Map(modules.map((m, i) => [m.moduleId, BAR_COLORS[i % BAR_COLORS.length]]));
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
    if (isPrefsLoaded) {
      setLayout(prefs.dashboardLayout);
    }
  }, [isPrefsLoaded]);
  useEffect(() => {
    if (isPrefsLoaded) {
      setPrefs({ dashboardLayout: layout });
    }
  }, [layout, setPrefs, isPrefsLoaded]);

  const updateLayoutItem = (id: DashboardWidgetId, patch: Partial<DashboardWidgetLayout>) => {
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

    return {
      column: columnWidth + columnGap,
      row: 72 + rowGap,
    };
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

  const renderHeader = (id: DashboardWidgetId): React.ReactNode => {
    const definition = getWidgetDefinition(id);
    if (id === 'moodle-deadlines') {
      return (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-offwhite">Moodle Deadlines</span>
          {!missingToken && (
            <span className="rounded bg-danger/15 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-danger">
              LIVE
            </span>
          )}
        </div>
      );
    }
    if (id === 'active-courses') {
      return (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-offwhite">Active Courses</span>
          <span className="flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
            {getCurrentSemester()}
          </span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2">
        <span className="text-lightGrey">{getWidgetIcon(id)}</span>
        <span className="text-sm font-medium text-offwhite">{definition.title}</span>
      </div>
    );
  };

  const renderWidget = (id: DashboardWidgetId): React.ReactNode => {
    switch (id) {
      case 'degree-completion':
        return statsLoading || modulesLoading ? (
          <InlineLoader />
        ) : (
          <DegreeCompletionContent
            totalTarget={totalTarget}
            studyRightEnd={studyRightEnd}
            gradedCount={gradedCount}
            gradeAverage={gradeAverage}
            creditsDone={creditsDone}
            modules={modules}
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
            semesterCredits={semesterCredits}
            activeCoursesCount={activeCourses.length}
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
          <TimelinePeekContent periods={periodSummaries} moduleIds={moduleIds} />
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
            <h1 className="text-2xl font-semibold text-balance text-offwhite">Dashboard</h1>
            <p className="mt-0.5 text-sm text-balance text-lightGrey">{getCurrentPeriodLabel()}</p>
          </div>

          <Button
            icon={getDashboardGridIcon()}
            onClick={() => setIsEditMode((current) => !current)}
            variant={isEditMode ? 'accent' : 'primary'}
          >
            {isEditMode ? 'Done Editing' : 'Customize Dashboard'}
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
                  previewLayout={previewLayout}
                  previewValid={previewValid}
                  x={x}
                  y={y}
                  isEditMode={isEditMode}
                />
              )),
            )}

            {layout.map((item) => (
              <DashboardWidgetShell
                key={item.id}
                header={renderHeader(item.id)}
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
                  <h2 className="text-lg font-semibold text-offwhite">Widget Library</h2>
                  <p className="mt-1 text-sm text-lightGrey">Add, remove, drag, and resize dashboard cards.</p>
                </div>
                <button
                  aria-label="Close dashboard editor"
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
                          <span className="text-lightGrey transition-[color] duration-200 group-hover:text-accent">
                            {getWidgetIcon(widget.id)}
                          </span>
                          {widget.title}
                        </span>
                        <span className="rounded-full bg-background px-2 py-0.5 font-mono text-[10px] text-lightGrey">
                          {openSlot ? `${widget.size.w}x${widget.size.h}` : 'No space'}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-lightGrey">{widget.description}</p>
                    </button>
                  );
                })}
                {hiddenWidgets.length === 0 && <EmptyWidgetState label="All widgets are on the board." />}
              </div>

              <div className="mt-auto rounded-xl bg-background/70 p-3 text-xs leading-relaxed text-lightGrey shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
                Drag widgets onto the dotted grid. Use + and - on each card to resize within its min and max size.
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </DragDropProvider>
  );
};

const MoodleMissingToken: React.FC = () => (
  <div className="flex flex-col gap-3">
    <div className="flex gap-2">
      <svg aria-hidden="true" className="size-8 text-lightGrey" fill="currentColor" viewBox="0 0 24 24">
        <path
          clipRule="evenodd"
          d="M2.25 6a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V6Zm3.97.97a.75.75 0 0 1 1.06 0l2.25 2.25a.75.75 0 0 1 0 1.06l-2.25 2.25a.75.75 0 0 1-1.06-1.06l1.72-1.72-1.72-1.72a.75.75 0 0 1 0-1.06Zm4.28 4.28a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5h-3Z"
          fillRule="evenodd"
        />
      </svg>

      <div className="text-offwhite">
        <p className="text-sm font-medium">Configuration missing</p>
        <p className="text-xs font-light">You need to first configure Moodle calendar.</p>
      </div>
    </div>
    <p className="text-xs font-light text-lightGrey">
      Head over to Moodle and export calendar URL with options: All Events and choose Custom Date Range.
    </p>
    <Button onClick={() => window.open('https://moodle.lut.fi/calendar/export.php?')}>Head over to Moodle</Button>
  </div>
);

export default DashboardView;
