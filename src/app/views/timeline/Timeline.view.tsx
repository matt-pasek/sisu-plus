import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { DragDropProvider, type DragEndEvent, type DragStartEvent } from '@dnd-kit/react';
import { Navigate, useParams } from 'react-router';
import { getTimelineCourses } from '@/app/api/dataPoints/getTimelineCourses';
import { getCreditsByPeriod, getCreditsBySemester } from '@/app/api/dataPoints/getCreditsByPeriod';
import { TimelineHeaderActions } from '@/app/views/timeline/components/TimelineHeaderActions.comp';
import { PageHeader } from '@/app/components/ui/PageHeader.comp';
import { Panel } from '@/app/components/ui/Panel.comp';
import { TimelineHero } from '@/app/views/timeline/components/hero/TimelineHero.comp';
import { todayKey } from '@/app/schedule/time';
import { getStructureData } from '@/app/api/dataPoints/getStructureData';
import { getDegreeTarget, getHeroStats } from '@/app/views/timeline/util/heroStats';
import { TimelineSidebar } from '@/app/views/timeline/components/sidebar/TimelineSidebar.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { getVisibleSemesters } from '@/app/views/timeline/util/getVisibleSemesters';
import { TimelineBoard } from '@/app/views/timeline/components/TimelineBoard/TimelineBoard.comp';
import { PageLoader } from '@/app/components/PageLoader.comp';
import { InspectorSlot } from '@/app/components/ui/InspectorSlot.comp';
import { AddCourseInspector } from '@/app/views/timeline/components/addCourse/AddCourseInspector.comp';
import { AddCourseSuggestions } from '@/app/views/timeline/components/addCourse/AddCourseSuggestions.comp';
import { useAddCourseFlow } from '@/app/views/timeline/hooks/useAddCourseFlow';
import {
  isTimelineCourseDragData,
  getMoveLocators,
  getTargetPeriodLocators,
  isPastPeriod,
  isPeriodVisible,
  sameLocators,
} from '@/app/views/timeline/util';
import { isCourseUnitAttainment } from '@/app/helpers/isCourseUnitAttainment';
import { useSisuQuery } from '@/app/hooks/useSisuQuery';
import { fetchPlans } from '@/app/api/endpoints/plans';
import { fetchAttainments } from '@/app/api/endpoints/attainments';
import { getStudyPeriodMap } from '@/app/api/dataPoints/getStudyPeriodMap';
import { useTimelineDraft } from '@/app/views/timeline/hooks/useTimelineDraft';
import { useTimelineValidation } from '@/app/views/timeline/hooks/useTimelineValidation';
import { useConfirmTimeline } from '@/app/views/timeline/hooks/useConfirmTimeline';
import { useHeroFold } from '@/app/views/timeline/hooks/useHeroFold';
import { useSuggestionWarmup } from '@/app/views/timeline/hooks/useSuggestionWarmup';

const FOCUS_FLASH_KEYFRAMES = [
  { boxShadow: '0 0 0 2px rgba(82,201,137,0.8)' },
  { boxShadow: '0 0 0 0 rgba(82,201,137,0)' },
];

const TimelineView: React.FC = () => {
  const { t } = useTranslationWithPrefix('views.timeline');
  const { planId } = useParams();
  const boardRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [activeDragCourseId, setActiveDragCourseId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hidePreviousPeriods, setHidePreviousPeriods] = useState(true);
  const [showHiddenSummerPeriods, setShowHiddenSummerPeriods] = useState(false);
  const [pendingFocusCourseId, setPendingFocusCourseId] = useState<string | null>(null);
  const heroFold = useHeroFold();
  const plansQuery = useSisuQuery(['plans'], fetchPlans);
  const attainmentsQuery = useSisuQuery(['attainments'], fetchAttainments);
  const selectedPlan =
    plansQuery.data?.find((plan) => plan.id === planId) ??
    plansQuery.data?.find((plan) => plan.primary) ??
    plansQuery.data?.[0];
  const selectedPlanId = selectedPlan?.id;
  const isPrimaryPlan = selectedPlan?.primary === true;
  const canAddCourses = isPrimaryPlan;
  const { timelineCourses, isLoading: coursesLoading, isSettled: coursesSettled } = getTimelineCourses(selectedPlanId);
  const { studyPeriodMap, isLoading: periodsLoading } = getStudyPeriodMap();
  const { data: structureData } = getStructureData();
  const isLoading = plansQuery.isLoading || attainmentsQuery.isLoading || coursesLoading || periodsLoading;
  const attainments = useMemo(
    () => (attainmentsQuery.data ?? []).filter(isCourseUnitAttainment),
    [attainmentsQuery.data],
  );
  const {
    draftPeriodsByCourseId,
    draftTimelineCourses,
    draftCourseIds,
    draftOriginalPeriodCounts,
    stageCoursePeriods,
    resetDraft,
  } = useTimelineDraft(timelineCourses, studyPeriodMap, selectedPlanId, coursesSettled);
  const { visibleValidationWarnings, validationIssueCount, prerequisitesLoading, dismissWarning, resetDismissed } =
    useTimelineValidation({
      planId: selectedPlanId,
      timelineCourses,
      draftTimelineCourses,
      attainments,
      studyPeriodMap,
    });
  const resetAll = useCallback(() => {
    resetDraft();
    resetDismissed();
  }, [resetDismissed, resetDraft]);
  useSuggestionWarmup({
    plan: selectedPlan,
    enabled: canAddCourses && !isLoading,
    courses: timelineCourses,
    attainments,
  });
  const addFlow = useAddCourseFlow({ planId: selectedPlanId, studyPeriodMap });
  const { dismiss: dismissAddFlow } = addFlow;
  useEffect(() => {
    if (!canAddCourses) dismissAddFlow();
  }, [canAddCourses, dismissAddFlow]);
  useEffect(() => {
    dismissAddFlow();
  }, [dismissAddFlow, selectedPlanId]);
  const confirmTimeline = useConfirmTimeline({
    planId: selectedPlanId,
    draft: draftPeriodsByCourseId,
    studyPeriodMap,
    onSaved: resetAll,
  });
  const activeDragCourse = useMemo(
    () => draftTimelineCourses.find((course) => course.courseUnitId === activeDragCourseId) ?? null,
    [activeDragCourseId, draftTimelineCourses],
  );
  const highlightedPeriodLocators = useMemo(() => {
    if (!isDragging || !activeDragCourse || activeDragCourse.teachingPeriodLocators.length === 0)
      return new Set<string>();

    const teachingPeriodLocators = new Set(activeDragCourse.teachingPeriodLocators);
    const periodCount = Math.max(activeDragCourse.plannedPeriods.length, 1);

    const highlightedLocators = new Set<string>();

    for (const periodLocator of studyPeriodMap.keys()) {
      const targetPeriodLocators = getTargetPeriodLocators(periodLocator, periodCount, studyPeriodMap);
      if (!targetPeriodLocators.every((locator) => teachingPeriodLocators.has(locator))) continue;

      for (const targetPeriodLocator of targetPeriodLocators) {
        highlightedLocators.add(targetPeriodLocator);
      }
    }

    return highlightedLocators;
  }, [activeDragCourse, isDragging, studyPeriodMap]);

  const allPeriods = useMemo(
    () => getCreditsByPeriod(draftTimelineCourses, studyPeriodMap),
    [draftTimelineCourses, studyPeriodMap],
  );

  const visiblePeriods = useMemo(
    () => allPeriods.filter((period) => isPeriodVisible(period, { hidePreviousPeriods, showHiddenSummerPeriods })),
    [allPeriods, hidePreviousPeriods, showHiddenSummerPeriods],
  );

  const semesters = useMemo(() => getVisibleSemesters(getCreditsBySemester(visiblePeriods)), [visiblePeriods]);

  const addablePeriodLocators = useMemo(
    () =>
      new Set(
        canAddCourses
          ? semesters.flatMap((semester) =>
              semester.periods.filter((period) => !isPastPeriod(period)).map((period) => period.periodLocator),
            )
          : [],
      ),
    [canAddCourses, semesters],
  );

  const addPeriod = useMemo(
    () => (canAddCourses ? allPeriods.find((period) => period.periodLocator === addFlow.openLocator) : undefined),
    [addFlow.openLocator, allPeriods, canAddCourses],
  );

  const heroStats = useMemo(
    () =>
      getHeroStats({
        periods: allPeriods,
        courses: draftTimelineCourses,
        target: isPrimaryPlan ? getDegreeTarget(structureData) : null,
        today: todayKey(),
      }),
    [allPeriods, draftTimelineCourses, isPrimaryPlan, structureData],
  );

  const unscheduledCourses = useMemo(
    () =>
      draftTimelineCourses.filter(
        (course) => course.plannedPeriods.length === 0 && !course.completionPeriod?.visibleByDefault,
      ),
    [draftTimelineCourses],
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const sourceData = event.operation.source?.data;
    if (!isTimelineCourseDragData(sourceData)) return;
    setActiveDragCourseId(sourceData.courseUnitId);
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveDragCourseId(null);
      setIsDragging(false);
      if (event.canceled || !selectedPlanId) return;

      const sourceData = event.operation.source?.data;
      const targetData = event.operation.target?.data;
      if (!isTimelineCourseDragData(sourceData)) return;
      const newPeriodLocators = getMoveLocators(sourceData, targetData, studyPeriodMap);
      if (!newPeriodLocators) return;
      if (sameLocators(sourceData.periodLocators, newPeriodLocators)) return;

      stageCoursePeriods(sourceData.courseUnitId, newPeriodLocators);
    },
    [selectedPlanId, stageCoursePeriods, studyPeriodMap],
  );

  const scrollToCourse = useCallback(
    (courseUnitId: string) => {
      const card = boardRef.current?.querySelector<HTMLElement>(`[data-course-id="${courseUnitId}"]`);
      if (!card) return false;
      card.scrollIntoView({ block: 'nearest', inline: 'center', behavior: shouldReduceMotion ? 'auto' : 'smooth' });
      card.focus({ preventScroll: true });
      if (!shouldReduceMotion) {
        card.animate(FOCUS_FLASH_KEYFRAMES, { duration: 1200, easing: 'cubic-bezier(0.25,1,0.5,1)' });
      }
      return true;
    },
    [shouldReduceMotion],
  );

  const focusCourse = useCallback(
    (courseUnitId: string) => {
      if (scrollToCourse(courseUnitId)) return;
      if (!hidePreviousPeriods && showHiddenSummerPeriods) return;
      setHidePreviousPeriods(false);
      setShowHiddenSummerPeriods(true);
      setPendingFocusCourseId(courseUnitId);
    },
    [hidePreviousPeriods, scrollToCourse, showHiddenSummerPeriods],
  );

  useEffect(() => {
    if (!pendingFocusCourseId) return;
    const frame = requestAnimationFrame(() => {
      scrollToCourse(pendingFocusCourseId);
      setPendingFocusCourseId(null);
    });
    return () => cancelAnimationFrame(frame);
  }, [pendingFocusCourseId, scrollToCourse, semesters]);

  if (isLoading) return <PageLoader />;

  if (!planId && selectedPlanId) {
    return <Navigate to={`/student/plan/${selectedPlanId}/timing`} replace />;
  }

  return (
    <DragDropProvider onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="-mx-6 -mt-6 flex h-[calc(100dvh-3rem)] flex-col gap-4 overflow-hidden px-6 pt-6 pb-6">
        <PageHeader
          title={t('title')}
          subtitle={selectedPlan?.name}
          actions={
            <TimelineHeaderActions
              confirmDisabled={
                draftPeriodsByCourseId.size === 0 ||
                prerequisitesLoading ||
                validationIssueCount > 0 ||
                addFlow.isWriting
              }
              confirmPending={confirmTimeline.isPending}
              confirmSaving={confirmTimeline.isSaving}
              onConfirm={() => confirmTimeline.mutate()}
              onReset={resetAll}
              pendingChangesCount={draftPeriodsByCourseId.size}
              resetDisabled={draftPeriodsByCourseId.size === 0}
              validationIssueCount={validationIssueCount}
            />
          }
        />
        <TimelineHero
          stats={heroStats}
          issueCount={validationIssueCount}
          folded={heroFold.folded}
          ready={heroFold.ready}
          onToggle={heroFold.toggle}
        />
        <div
          className="relative grid min-h-0 flex-1 gap-4 motion-reduce:transition-none max-lg:grid-cols-[minmax(0,1fr)] max-lg:grid-rows-[auto_minmax(0,1fr)] lg:grid-cols-[280px_minmax(0,1fr)_var(--inspector-width)] lg:gap-x-0 lg:transition-[grid-template-columns] lg:duration-200 lg:ease-[cubic-bezier(0.25,1,0.5,1)]"
          style={{ '--inspector-width': addPeriod ? '332px' : '0px' } as React.CSSProperties}
        >
          <TimelineSidebar
            courses={draftTimelineCourses}
            onSelectIssue={focusCourse}
            draftCourseIds={draftCourseIds}
            draftOriginalPeriodCounts={draftOriginalPeriodCounts}
            hidePreviousPeriods={hidePreviousPeriods}
            isDragging={isDragging}
            unscheduledCourses={unscheduledCourses}
            onHidePreviousPeriodsChange={setHidePreviousPeriods}
            onDismissValidationWarning={dismissWarning}
            onShowHiddenSummerPeriodsChange={setShowHiddenSummerPeriods}
            showHiddenSummerPeriods={showHiddenSummerPeriods}
            validationWarnings={visibleValidationWarnings}
          />
          <Panel footer={canAddCourses ? undefined : t('addCourse.primaryOnly')}>
            <TimelineBoard
              activeAddLocator={addPeriod?.periodLocator ?? null}
              addablePeriodLocators={addablePeriodLocators}
              onAddCourse={addFlow.open}
              draftCourseIds={draftCourseIds}
              highlightedPeriodLocators={highlightedPeriodLocators}
              isDragging={isDragging}
              semesters={semesters}
              onDismissValidationWarning={dismissWarning}
              onResizeCourse={stageCoursePeriods}
              scrollRef={boardRef}
              validationWarnings={visibleValidationWarnings}
            />
          </Panel>
          <InspectorSlot
            slotKey={addPeriod?.periodLocator ?? null}
            className="max-lg:absolute max-lg:inset-y-0 max-lg:right-0 max-lg:z-30 max-lg:w-[min(340px,100%)]"
          >
            {addPeriod && (
              <AddCourseInspector period={addPeriod} onClose={addFlow.close}>
                <AddCourseSuggestions
                  plan={selectedPlan}
                  targetLocator={addPeriod.periodLocator}
                  courses={draftTimelineCourses}
                  studyPeriodMap={studyPeriodMap}
                  attainments={attainments}
                  pendingAddId={addFlow.pendingAddId}
                  lastAddedId={addFlow.lastAddedId}
                  keepVisibleId={addFlow.keepVisibleId}
                  isWriting={addFlow.isWriting}
                  onAdd={addFlow.add}
                  onUndo={addFlow.undo}
                />
              </AddCourseInspector>
            )}
          </InspectorSlot>
        </div>
      </div>
    </DragDropProvider>
  );
};

export default TimelineView;
