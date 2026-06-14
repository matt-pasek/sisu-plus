import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DragDropProvider, type DragEndEvent, type DragStartEvent } from '@dnd-kit/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Navigate, useParams } from 'react-router';
import { updatePlan } from '@/app/api/endpoints/updatePlan';
import { autoSchedule } from '@/app/api/dataPoints/autoSchedule';
import { getTimelineCourses, type TimelineCourse } from '@/app/api/dataPoints/getTimelineCourses';
import { getCreditsByPeriod, getCreditsBySemester } from '@/app/api/dataPoints/getCreditsByPeriod';
import type { Plan } from '@/app/api/generated/OsuvaApi';
import { resolvePrerequisites } from '@/app/api/resolvers/resolvePrerequisites';
import { TimelineToolbar } from '@/app/views/timeline/components/TimelineToolbar.comp';
import { TimelineCoursePool } from '@/app/views/timeline/components/TimelineCoursePool.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { getVisibleSemesters } from '@/app/views/timeline/util/getVisibleSemesters';
import { TimelineBoard } from '@/app/views/timeline/components/TimelineBoard/TimelineBoard.comp';
import { PageLoader } from '@/app/components/PageLoader.comp';
import {
  type TimelineValidationWarning,
  getValidationWarnings,
  isTimelineCourseDragData,
  applyDraftToCourses,
  applyDraftToPlan,
  getCourseLocators,
  getMoveLocators,
  getTargetPeriodLocators,
  isPeriodVisible,
  sameLocators,
} from '@/app/views/timeline/util';
import { isCourseUnitAttainment } from '@/app/helpers/isCourseUnitAttainment';
import { useSisuQuery } from '@/app/hooks/useSisuQuery';
import { fetchPlans } from '@/app/api/endpoints/plans';
import { fetchAttainments } from '@/app/api/endpoints/attainments';
import { getStudyPeriodMap } from '@/app/api/dataPoints/getStudyPeriodMap';

const TimelineView: React.FC = () => {
  const { t, i18n } = useTranslationWithPrefix('views.timeline');
  const { planId } = useParams();
  const queryClient = useQueryClient();
  const [activeDragCourseId, setActiveDragCourseId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAutoScheduling, setIsAutoScheduling] = useState(false);
  const [hidePreviousPeriods, setHidePreviousPeriods] = useState(true);
  const [showHiddenSummerPeriods, setShowHiddenSummerPeriods] = useState(false);
  const [dismissedPrerequisiteWarningIds, setDismissedPrerequisiteWarningIds] = useState<Set<string>>(new Set());
  const [draftPeriodsByCourseId, setDraftPeriodsByCourseId] = useState<Map<string, string[]>>(new Map());
  const plansQuery = useSisuQuery(['plans'], fetchPlans);
  const attainmentsQuery = useSisuQuery(['attainments'], fetchAttainments);
  const selectedPlan =
    plansQuery.data?.find((plan) => plan.id === planId) ??
    plansQuery.data?.find((plan) => plan.primary) ??
    plansQuery.data?.[0];
  const selectedPlanId = selectedPlan?.id;
  const { timelineCourses, isLoading: coursesLoading } = getTimelineCourses(selectedPlanId);
  const { studyPeriodMap, isLoading: periodsLoading } = getStudyPeriodMap();
  const isLoading = plansQuery.isLoading || attainmentsQuery.isLoading || coursesLoading || periodsLoading;
  const draftTimelineCourses = useMemo(
    () => applyDraftToCourses(timelineCourses, draftPeriodsByCourseId, studyPeriodMap),
    [draftPeriodsByCourseId, studyPeriodMap, timelineCourses],
  );
  const draftCourseIds = useMemo(() => new Set(draftPeriodsByCourseId.keys()), [draftPeriodsByCourseId]);
  const draftOriginalPeriodCounts = useMemo(
    () =>
      new Map(
        timelineCourses
          .filter((course) => draftPeriodsByCourseId.has(course.courseUnitId) && course.plannedPeriods.length > 0)
          .map((course) => [course.courseUnitId, course.plannedPeriods.length] as const),
      ),
    [draftPeriodsByCourseId, timelineCourses],
  );
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
  const prerequisiteQuery = useSisuQuery(
    ['timeline-prerequisites', selectedPlanId],
    async () =>
      new Map(
        await Promise.all(
          timelineCourses.map(
            async (course) => [course.courseUnitId, await resolvePrerequisites(course.courseUnitId)] as const,
          ),
        ),
      ),
    { enabled: selectedPlanId != null && timelineCourses.length > 0 },
  );
  const validationWarnings = useMemo(() => {
    const warnings = getValidationWarnings(
      draftTimelineCourses,
      prerequisiteQuery.data ?? new Map(),
      (attainmentsQuery.data ?? []).filter(isCourseUnitAttainment),
    );
    return new Map(
      [...warnings].map(([courseUnitId, courseWarnings]) => [
        courseUnitId,
        courseWarnings.map((warning) => {
          if (warning.type === 'period') {
            const periods = warning.id
              .split(':')
              .slice(2)
              .map((locator) => studyPeriodMap.get(locator)?.name ?? locator)
              .join(', ');
            return { ...warning, message: t('validation.missingPeriod', { periods }) };
          }
          return {
            ...warning,
            message: t('validation.prerequisite', { course: warning.message || t('validation.requiredCourse') }),
          };
        }),
      ]),
    );
  }, [attainmentsQuery.data, draftTimelineCourses, prerequisiteQuery.data, studyPeriodMap, t]);
  const visibleValidationWarnings = useMemo(() => {
    const visibleWarnings = new Map<string, TimelineValidationWarning[]>();

    for (const [courseUnitId, warnings] of validationWarnings) {
      const filteredWarnings = warnings.filter(
        (warning) => warning.type !== 'prerequisite' || !dismissedPrerequisiteWarningIds.has(warning.id),
      );
      if (filteredWarnings.length > 0) visibleWarnings.set(courseUnitId, filteredWarnings);
    }

    return visibleWarnings;
  }, [dismissedPrerequisiteWarningIds, validationWarnings]);
  const validationIssueCount = useMemo(
    () => [...visibleValidationWarnings.values()].reduce((sum, warnings) => sum + warnings.length, 0),
    [visibleValidationWarnings],
  );
  const confirmTimeline = useMutation({
    mutationFn: async () => {
      if (!selectedPlan || !selectedPlanId) throw new Error('Plan not found.');
      return updatePlan(selectedPlanId, applyDraftToPlan(selectedPlan, draftPeriodsByCourseId));
    },
    onSuccess: (updatedPlan) => {
      const lang = i18n.language;
      queryClient.setQueryData<Plan[]>(
        ['plans', lang],
        (plans) => plans?.map((plan) => (plan.id === updatedPlan.id ? updatedPlan : plan)) ?? [updatedPlan],
      );
      queryClient.setQueryData<TimelineCourse[]>(
        ['timeline-courses', selectedPlanId, lang],
        applyDraftToCourses(timelineCourses, draftPeriodsByCourseId, studyPeriodMap),
      );
      setDraftPeriodsByCourseId(new Map());
      setDismissedPrerequisiteWarningIds(new Set());
    },
  });

  useEffect(() => {
    setDraftPeriodsByCourseId(new Map());
    setDismissedPrerequisiteWarningIds(new Set());
  }, [selectedPlanId]);

  const moduleIds = useMemo(
    () => [
      ...new Set(
        draftTimelineCourses
          .map((course) => course.moduleId)
          .filter((moduleId): moduleId is string => moduleId != null),
      ),
    ],
    [draftTimelineCourses],
  );

  const moduleNames = useMemo(
    () =>
      moduleIds.map(
        (moduleId) =>
          draftTimelineCourses.find((course) => course.moduleId === moduleId)?.moduleName ??
          t('validation.unknownModule'),
      ),
    [draftTimelineCourses, moduleIds, t],
  );

  const semesters = useMemo(() => {
    const periods = getCreditsByPeriod(draftTimelineCourses, studyPeriodMap).filter((period) =>
      isPeriodVisible(period, { hidePreviousPeriods, showHiddenSummerPeriods }),
    );
    return getVisibleSemesters(getCreditsBySemester(periods));
  }, [draftTimelineCourses, hidePreviousPeriods, showHiddenSummerPeriods, studyPeriodMap]);

  const unscheduledCourses = useMemo(
    () =>
      draftTimelineCourses.filter(
        (course) => course.plannedPeriods.length === 0 && !course.completionPeriod?.visibleByDefault,
      ),
    [draftTimelineCourses],
  );

  const stageCoursePeriods = useCallback(
    (courseUnitId: string, newPeriodLocators: string[]) => {
      const course = timelineCourses.find((candidate) => candidate.courseUnitId === courseUnitId);
      if (!course) return;

      const originalLocators = getCourseLocators(course);
      setDraftPeriodsByCourseId((current) => {
        const next = new Map(current);
        if (sameLocators(originalLocators, newPeriodLocators)) {
          next.delete(courseUnitId);
        } else {
          next.set(courseUnitId, newPeriodLocators);
        }
        return next;
      });
    },
    [timelineCourses],
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

  // TODO: rewrite this, make it smart auto-schedule
  const handleAutoSchedule = useCallback(() => {
    if (!selectedPlanId || isAutoScheduling) return;

    const run = async () => {
      setIsAutoScheduling(true);
      try {
        const prereqEntries = await Promise.all(
          draftTimelineCourses.map(
            async (course) => [course.courseUnitId, await resolvePrerequisites(course.courseUnitId)] as const,
          ),
        );
        const result = autoSchedule({
          courses: draftTimelineCourses,
          periodMap: studyPeriodMap,
          attainments: (attainmentsQuery.data ?? []).filter(isCourseUnitAttainment),
          prereqMap: new Map(prereqEntries),
        });

        for (const [courseUnitId, newPeriodLocators] of result.assignments) {
          const course = draftTimelineCourses.find((candidate) => candidate.courseUnitId === courseUnitId);
          const currentLocators = course?.plannedPeriods.map((period) => period.locator) ?? [];
          if (sameLocators(currentLocators, newPeriodLocators)) continue;

          stageCoursePeriods(courseUnitId, newPeriodLocators);
        }
      } finally {
        setIsAutoScheduling(false);
      }
    };

    void run();
  }, [
    attainmentsQuery.data,
    draftTimelineCourses,
    isAutoScheduling,
    selectedPlanId,
    stageCoursePeriods,
    studyPeriodMap,
  ]);

  if (isLoading) return <PageLoader />;

  if (!planId && selectedPlanId) {
    return <Navigate to={`/student/plan/${selectedPlanId}/timing`} replace />;
  }

  return (
    <DragDropProvider onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="-mx-6 -mt-6 flex h-[calc(100dvh-3rem)] flex-col overflow-hidden bg-background text-offwhite">
        <TimelineToolbar
          moduleIds={moduleIds}
          moduleNames={moduleNames}
          confirmDisabled={draftPeriodsByCourseId.size === 0 || prerequisiteQuery.isLoading || validationIssueCount > 0}
          confirmPending={confirmTimeline.isPending}
          onConfirm={() => confirmTimeline.mutate()}
          onReset={() => {
            setDraftPeriodsByCourseId(new Map());
            setDismissedPrerequisiteWarningIds(new Set());
          }}
          pendingChangesCount={draftPeriodsByCourseId.size}
          resetDisabled={draftPeriodsByCourseId.size === 0}
          validationIssueCount={validationIssueCount}
        />
        <div className="flex min-h-0 flex-1">
          <TimelineCoursePool
            draftCourseIds={draftCourseIds}
            draftOriginalPeriodCounts={draftOriginalPeriodCounts}
            hidePreviousPeriods={hidePreviousPeriods}
            isDragging={isDragging}
            unscheduledCourses={unscheduledCourses}
            onHidePreviousPeriodsChange={setHidePreviousPeriods}
            onDismissValidationWarning={(warningId) =>
              setDismissedPrerequisiteWarningIds((current) => new Set(current).add(warningId))
            }
            onShowHiddenSummerPeriodsChange={setShowHiddenSummerPeriods}
            showHiddenSummerPeriods={showHiddenSummerPeriods}
            validationWarnings={visibleValidationWarnings}
          />
          <TimelineBoard
            draftCourseIds={draftCourseIds}
            highlightedPeriodLocators={highlightedPeriodLocators}
            isDragging={isDragging}
            semesters={semesters}
            onDismissValidationWarning={(warningId) =>
              setDismissedPrerequisiteWarningIds((current) => new Set(current).add(warningId))
            }
            onResizeCourse={stageCoursePeriods}
            validationWarnings={visibleValidationWarnings}
          />
        </div>
      </div>
    </DragDropProvider>
  );
};

export default TimelineView;
