import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DragDropProvider, type DragEndEvent, type DragMoveEvent } from '@dnd-kit/react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useNavigate } from 'react-router';
import { fetchAttainments } from '@/app/api/endpoints/attainments';
import { fetchPlans } from '@/app/api/endpoints/plans';
import { getActiveCourses } from '@/app/api/dataPoints/getActiveCourses';
import { getCreditsByModule } from '@/app/api/dataPoints/getCreditsByModule';
import { getCreditsByPeriod, getCreditsBySemester } from '@/app/api/dataPoints/getCreditsByPeriod';
import { getDashboardStats } from '@/app/api/dataPoints/getDashboardStats';
import { getMoodleDeadlines } from '@/app/api/dataPoints/getMoodleDeadlines';
import { getRegistrationCourses } from '@/app/api/dataPoints/getRegistrationCourses';
import { getStudyPeriodMap } from '@/app/api/dataPoints/getStudyPeriodMap';
import { getTimelineCourses } from '@/app/api/dataPoints/getTimelineCourses';
import { resolveCourseUnit } from '@/app/api/resolvers/resolveCourseUnit';
import { InlineLoader } from '@/app/components/ui/InlineLoader.comp';
import { daysUntil } from '@/app/helpers/daysUntilToday';
import { useSisuQuery } from '@/app/hooks/useSisuQuery';
import { useChromeStorage } from '@/app/hooks/useChromeStorage';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { MODULE_COLOR_VALUES } from '@/app/theme/moduleColors';
import { DashboardGridIcon } from './components/icons/DashboardGridIcon.comp';
import { DashboardHero } from './components/hero/DashboardHero.comp';
import { DashboardControlButton } from './components/DashboardControlButton.comp';
import { DashboardCell } from './components/DashboardCell.comp';
import { MoodleMissingToken } from './components/MoodleMissingToken.comp';
import {
  canPlaceDashboardWidget,
  clampWidgetLayout,
  DASHBOARD_COLUMNS,
  DASHBOARD_ROWS,
  type DashboardWidgetId,
  type DashboardWidgetLayout,
  findOpenDashboardSlot,
  getHiddenWidgets,
  sanitizeDashboardLayout,
} from './util/widgetsHandlers';
import { getOpenRegistrationCount } from './util/registrationWidgetData';
import { isDashboardWidgetDragData } from './util/dndHandlers';
import { getCurrentSemester } from './util/periodLabel';
import { formatStudyRightEnd, isCourseUnitAttainment, getGrade } from './util/attainmentHelpers';
import type { DashboardCompletedCourse } from './types/DashboardCompletedCourse.type';
import { MoodleDeadlinesContent } from '@/app/views/dashboard/components/widget/contents/MoodleDeadlinesContent.comp';
import { WidgetIcon } from '@/app/views/dashboard/components/widget/WidgetIcon.comp';
import { DegreeCompletionContent } from '@/app/views/dashboard/components/widget/contents/DegreeCompletionContent.comp';
import { ActiveCoursesContent } from '@/app/views/dashboard/components/widget/contents/ActiveCoursesContent.comp';
import { SemesterStatsContent } from '@/app/views/dashboard/components/widget/contents/SemesterStatsContent.comp';
import { GradeTrendContent } from '@/app/views/dashboard/components/widget/contents/GradeTrendContent.comp';
import { CreditsVelocityContent } from '@/app/views/dashboard/components/widget/contents/CreditsVelocityContent.comp';
import { TimelinePeekContent } from '@/app/views/dashboard/components/widget/contents/TimelinePeekContent.comp';
import { RecentAchievementsContent } from '@/app/views/dashboard/components/widget/contents/RecentAchievementsContent.comp';
import { WorkloadForecastContent } from '@/app/views/dashboard/components/widget/contents/WorkloadForecastContent.comp';
import { GradeDonutContent } from '@/app/views/dashboard/components/widget/contents/GradeDonutContent.comp';
import { CreditPaceContent } from '@/app/views/dashboard/components/widget/contents/CreditPaceContent.comp';
import { NextExamContent } from '@/app/views/dashboard/components/widget/contents/NextExamContent.comp';
import { UpcomingRegistrationsContent } from '@/app/views/dashboard/components/widget/contents/UpcomingRegistrationsContent.comp';
import { CourseMapContent } from '@/app/views/dashboard/components/widget/contents/CourseMapContent.comp';
import { DashboardWidgetShell } from '@/app/views/dashboard/components/widget/DashboardWidgetShell.comp';
import { EmptyWidgetState } from '@/app/views/dashboard/components/widget/EmptyWidgetState.comp';

interface DragTransform {
  x: number;
  y: number;
}

type WidgetIconName = Parameters<typeof WidgetIcon>[0]['name'];

interface WidgetMeta {
  icon: WidgetIconName;
  eyebrowKey: string;
}

const WIDGET_META: Record<DashboardWidgetId, WidgetMeta> = {
  'degree-completion': { icon: 'degree', eyebrowKey: 'degreeCompletion' },
  'active-courses': { icon: 'courses', eyebrowKey: 'activeCourses' },
  'moodle-deadlines': { icon: 'moodle', eyebrowKey: 'moodleDeadlines' },
  'semester-stats': { icon: 'stats', eyebrowKey: 'semesterStats' },
  'grade-trend': { icon: 'grade', eyebrowKey: 'gradeTrend' },
  'credits-velocity': { icon: 'velocity', eyebrowKey: 'creditsVelocity' },
  'timeline-peek': { icon: 'timeline', eyebrowKey: 'timelinePeek' },
  'recent-achievements': { icon: 'trophy', eyebrowKey: 'recentAchievements' },
  'workload-forecast': { icon: 'workload', eyebrowKey: 'workloadForecast' },
  'grade-donut': { icon: 'donut', eyebrowKey: 'gradeDonut' },
  'credit-pace': { icon: 'pace', eyebrowKey: 'creditPace' },
  'next-exam': { icon: 'exam', eyebrowKey: 'nextExam' },
  'upcoming-registrations': { icon: 'registration', eyebrowKey: 'upcomingRegistrations' },
  'course-map': { icon: 'map', eyebrowKey: 'courseMap' },
};

type BadgeKind = 'accent' | 'live' | 'warn' | 'mut';

const Badge: React.FC<{ kind?: BadgeKind; dot?: boolean; children: React.ReactNode }> = ({
  kind = 'mut',
  dot,
  children,
}) => {
  const styles: Record<BadgeKind, string> = {
    accent: 'bg-accent/13 text-lighterGreen',
    live: 'bg-lighterGreen/12 text-lighterGreen',
    warn: 'bg-warn/13 text-warn',
    mut: 'bg-container2 text-lightGrey',
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${styles[kind]}`}
    >
      {dot && (
        <span
          className="size-[6px] rounded-full"
          style={{
            background: 'currentColor',
            ...(kind === 'live'
              ? { animation: 'sisuPulse 2s infinite', boxShadow: '0 0 0 0 rgba(82,201,137,0.6)' }
              : {}),
          }}
        />
      )}
      {children}
    </span>
  );
};

const HeaderLink: React.FC<{ children: React.ReactNode; onClick: () => void }> = ({ children, onClick }) => (
  <button
    className="flex items-center gap-1.5 rounded-lg px-2 py-1 font-mono text-[10px] font-semibold tracking-[0.12em] text-lightGrey uppercase transition-[background-color,color,transform] duration-150 hover:bg-offwhite/10 hover:text-offwhite active:scale-[0.96]"
    onClick={(event) => {
      event.stopPropagation();
      onClick();
    }}
    type="button"
  >
    <span>{children}</span>
    <svg
      aria-hidden="true"
      className="size-3"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  </button>
);

const DashboardView: React.FC = () => {
  const { t } = useTranslationWithPrefix('views.dashboard');
  const shouldReduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const [prefs, setPrefs, isPrefsLoaded] = useChromeStorage();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLibraryCollapsed, setIsLibraryCollapsed] = useState(false);
  const [layout, setLayout] = useState<DashboardWidgetLayout[]>(sanitizeDashboardLayout(prefs.dashboardLayout));
  const [previewLayout, setPreviewLayout] = useState<DashboardWidgetLayout | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const { deadlines, deadlinesLoading, missingToken } = getMoodleDeadlines();
  const { courses: registrationCourses, isLoading: registrationCoursesLoading } = getRegistrationCourses();
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

  const addWidget = (id: DashboardWidgetId) => {
    setLayout((current) => {
      const openSlot = findOpenDashboardSlot(current, id);
      return openSlot ? [...current, openSlot] : current;
    });
  };

  const removeWidget = (id: DashboardWidgetId) => {
    setLayout((current) => current.filter((item) => item.id !== id));
  };

  const getBadge = (id: DashboardWidgetId): React.ReactNode => {
    if (id === 'next-exam') {
      return (
        <HeaderLink onClick={() => navigate('/student/enrolments')}>{t('widgets.actions.openRegistration')}</HeaderLink>
      );
    }
    if (id === 'upcoming-registrations') {
      const openCount = getOpenRegistrationCount(registrationCourses);
      if (openCount > 0) {
        return (
          <Badge kind="warn" dot>
            {t('widgets.registration.openNowCount', { count: openCount })}
          </Badge>
        );
      }
      return (
        <HeaderLink onClick={() => navigate('/student/enrolments')}>{t('widgets.actions.openRegistration')}</HeaderLink>
      );
    }
    if (id === 'timeline-peek') {
      return (
        <HeaderLink
          onClick={() => navigate(selectedPlanId ? `/student/plan/${selectedPlanId}/timing` : '/student/plan')}
        >
          {t('widgets.actions.openTimeline')}
        </HeaderLink>
      );
    }
    if (id === 'moodle-deadlines' && !missingToken) {
      return (
        <Badge kind="live" dot>
          LIVE
        </Badge>
      );
    }
    if (id === 'active-courses') {
      return (
        <Badge kind="accent" dot>
          {getCurrentSemester(t)}
        </Badge>
      );
    }
    if (id === 'recent-achievements' && (completedCoursesQuery.data?.length ?? 0) > 0) {
      return <Badge kind="accent">{completedCoursesQuery.data!.length} passed</Badge>;
    }
    return null;
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
      case 'grade-donut':
        return completedCoursesQuery.isLoading ? (
          <InlineLoader />
        ) : (
          <GradeDonutContent courses={completedCoursesQuery.data ?? []} />
        );
      case 'credit-pace':
        return statsLoading ? (
          <InlineLoader />
        ) : (
          <CreditPaceContent
            creditsDone={creditsDone}
            totalTarget={totalTarget}
            studyRightEndDate={studyRightEndDate}
          />
        );
      case 'next-exam':
        return registrationCoursesLoading ? <InlineLoader /> : <NextExamContent courses={registrationCourses} />;
      case 'upcoming-registrations':
        return registrationCoursesLoading ? (
          <InlineLoader />
        ) : (
          <UpcomingRegistrationsContent courses={registrationCourses} />
        );
      case 'course-map':
        return timelineLoading || modulesLoading ? (
          <InlineLoader />
        ) : (
          <CourseMapContent timelineCourses={timelineCourses} modules={modules} />
        );
    }
  };

  return (
    <DragDropProvider onDragMove={handleDragMove} onDragEnd={handleDragEnd}>
      <style>{`
        @keyframes sisuPulse {
          0% { box-shadow: 0 0 0 0 rgba(82,201,137,0.5); }
          70% { box-shadow: 0 0 0 5px rgba(82,201,137,0); }
          100% { box-shadow: 0 0 0 0 rgba(82,201,137,0); }
        }

        @keyframes sisuWidgetBarRevealX {
          from { transform: scaleX(0); opacity: 0.62; }
          to { transform: scaleX(1); opacity: 1; }
        }

        @keyframes sisuWidgetBarRevealY {
          from { transform: scaleY(0); opacity: 0.62; }
          to { transform: scaleY(1); opacity: 1; }
        }

        @keyframes sisuWidgetLineDraw {
          from { stroke-dashoffset: 1; opacity: 0.55; }
          to { stroke-dashoffset: 0; opacity: 1; }
        }

        @keyframes sisuWidgetRingReveal {
          from { stroke-dashoffset: var(--sisu-ring-from, 1); opacity: 0.45; }
          to { stroke-dashoffset: var(--sisu-ring-to, 0); opacity: 1; }
        }

        @keyframes sisuWidgetFadeLift {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes heroAurora1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(40px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 30px) scale(0.97); }
        }

        @keyframes heroAurora2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40% { transform: translate(-50px, 15px) scale(1.08); }
          70% { transform: translate(25px, -25px) scale(0.95); }
        }

        @keyframes heroAurora3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(30px, 40px) scale(1.03); }
          75% { transform: translate(-35px, -10px) scale(1.06); }
        }

        .sisu-widget-bar-x {
          animation: sisuWidgetBarRevealX 360ms cubic-bezier(0.22, 1, 0.36, 1) both;
          transform-origin: left center;
        }

        .sisu-widget-bar-y {
          animation: sisuWidgetBarRevealY 420ms cubic-bezier(0.22, 1, 0.36, 1) both;
          transform-origin: center bottom;
        }

        .sisu-widget-line {
          animation: sisuWidgetLineDraw 520ms cubic-bezier(0.22, 1, 0.36, 1) both;
          stroke-dasharray: 1;
          stroke-dashoffset: 0;
        }

        .sisu-widget-ring {
          animation: sisuWidgetRingReveal 560ms cubic-bezier(0.22, 1, 0.36, 1) both;
          stroke-dashoffset: 0;
        }

        .sisu-widget-fade-lift {
          animation: sisuWidgetFadeLift 280ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @media (prefers-reduced-motion: reduce) {
          [data-dashboard-widget-shell],
          [data-dashboard-widget-shell] * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }

          [data-dashboard-hero],
          [data-dashboard-hero] * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <div className="mx-auto flex w-full flex-col gap-5 pb-8">
        <DashboardHero
          activeCoursesCount={activeCourses.length}
          completedCourses={completedCoursesQuery.data}
          creditsDone={creditsDone}
          deadlines={deadlines}
          gradeAverage={gradeAverage}
          gradedCount={gradedCount}
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
                    badge={getBadge(item.id)}
                    isEditMode={isEditMode}
                    item={item}
                    onRemove={removeWidget}
                    onResize={(id, delta) => updateLayoutItem(id, delta)}
                    shouldReduceMotion={shouldReduceMotion}
                  >
                    {renderWidget(item.id)}
                  </DashboardWidgetShell>
                );
              })}
            </div>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {isEditMode && (
            <motion.aside
              animate={{ x: 0, opacity: 1 }}
              className="fixed top-0 right-0 z-40 flex h-dvh flex-col border-l border-border bg-container shadow-[-18px_0_40px_rgba(0,0,0,0.28)]"
              exit={{ x: 28, opacity: 0 }}
              initial={{ x: 28, opacity: 0 }}
              style={{ width: isLibraryCollapsed ? 40 : 320 }}
              transition={{ type: 'spring', duration: 0.34, bounce: 0 }}
            >
              <button
                aria-label={isLibraryCollapsed ? 'Expand widget library' : 'Collapse widget library'}
                className="absolute top-1/2 -left-3 z-10 flex size-6 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-container2 text-lightGrey shadow-md transition-[background-color,color,transform] duration-150 hover:bg-offwhite/10 hover:text-offwhite active:scale-90"
                onClick={() => setIsLibraryCollapsed((v) => !v)}
                type="button"
              >
                <svg
                  aria-hidden="true"
                  className={`size-3 transition-transform duration-300 ${isLibraryCollapsed ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>

              {!isLibraryCollapsed && (
                <div className="flex flex-1 flex-col overflow-hidden px-4 pt-[41px] pb-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-offwhite">{t('editor.libraryTitle')}</h2>
                      <p className="mt-1 text-sm text-lightGrey">{t('editor.libraryDescription')}</p>
                    </div>
                    <button
                      aria-label={t('widgets.actions.closeEditor')}
                      className="flex size-10 items-center justify-center rounded-lg bg-container2 text-lightGrey transition-[background-color,color,transform] duration-150 hover:bg-offwhite/10 hover:text-offwhite active:scale-[0.96]"
                      onClick={() => {
                        setIsEditMode(false);
                        setIsLibraryCollapsed(false);
                      }}
                      type="button"
                    >
                      <svg
                        aria-hidden="true"
                        className="size-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        viewBox="0 0 24 24"
                      >
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="mt-5 flex flex-col gap-2.5 overflow-y-auto pr-1">
                    {hiddenWidgets.map((widget) => {
                      const openSlot = findOpenDashboardSlot(layout, widget.id);
                      const meta = WIDGET_META[widget.id];
                      const widgetTitle = t(
                        `widgets.titles.${widget.id.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase())}`,
                      );
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
                            <div className="flex items-center gap-2.5">
                              <WidgetIcon name={meta.icon} />
                              <div>
                                <p className="font-mono text-[9px] font-semibold tracking-widest text-lightGrey uppercase">
                                  {t(`widgets.eyebrows.${meta.eyebrowKey}`)}
                                </p>
                                <p className="text-sm font-semibold text-offwhite">{widgetTitle}</p>
                              </div>
                            </div>
                            <span className="rounded-full bg-background px-2 py-0.5 font-mono text-[10px] text-lightGrey">
                              {openSlot ? `${widget.size.w}×${widget.size.h}` : t('widgets.actions.noSpace')}
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
                </div>
              )}
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </DragDropProvider>
  );
};

export default DashboardView;
