import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DragDropProvider, type DragEndEvent, type DragStartEvent } from '@dnd-kit/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Navigate, useParams } from 'react-router';
import { fetchAttainments, type Attainment } from '@/app/api/endpoints/attainments';
import { fetchPlans } from '@/app/api/endpoints/plans';
import { updatePlan } from '@/app/api/endpoints/updatePlan';
import { autoSchedule } from '@/app/api/dataPoints/autoSchedule';
import { getTimelineCourses, type TimelineCourse } from '@/app/api/dataPoints/getTimelineCourses';
import { getStudyPeriodMap } from '@/app/api/dataPoints/getStudyPeriodMap';
import { getCreditsByPeriod, getCreditsBySemester } from '@/app/api/dataPoints/getCreditsByPeriod';
import type { StudyPeriodInfo } from '@/app/api/dataPoints/getStudyPeriodMap';
import type { CourseUnitAttainmentRestricted } from '@/app/api/generated/OriApi';
import type { Plan } from '@/app/api/generated/OsuvaApi';
import type { PrerequisiteInfo } from '@/app/api/resolvers/resolvePrerequisites';
import { resolvePrerequisites } from '@/app/api/resolvers/resolvePrerequisites';
import { InlineLoader } from '@/app/components/ui/InlineLoader.comp';
import { useSisuQuery } from '@/app/hooks/useSisuQuery';
import { TimelineToolbar } from '@/app/views/timeline/components/TimelineToolbar.comp';
import { TimelineCoursePool } from '@/app/views/timeline/components/TimelineCoursePool.comp';
import { TimelineBoard } from '@/app/views/timeline/components/TimelineBoard.comp';
import { isTimelineCourseDragData, isTimelineDropData } from '@/app/views/timeline/components/timelineDnd';
import { getVisibleSemesters } from '@/app/views/timeline/components/timelineUtils';
import type { TimelineValidationWarning } from '@/app/views/timeline/components/timelineValidation';

function isCourseUnitAttainment(attainment: Attainment): attainment is CourseUnitAttainmentRestricted {
  return attainment.type === 'CourseUnitAttainment';
}

function sameLocators(first: string[], second: string[]): boolean {
  return first.length === second.length && first.every((locator, index) => locator === second[index]);
}

function getCourseLocators(course: TimelineCourse): string[] {
  return course.plannedPeriods.map((period) => period.locator);
}

function applyDraftToCourses(
  courses: TimelineCourse[],
  draft: Map<string, string[]>,
  periodsByLocator: Map<string, StudyPeriodInfo>,
): TimelineCourse[] {
  if (draft.size === 0) return courses;

  return courses.map((course) => {
    const draftLocators = draft.get(course.courseUnitId);
    if (!draftLocators) return course;

    return {
      ...course,
      plannedPeriods: draftLocators
        .map((locator) => periodsByLocator.get(locator))
        .filter((period): period is StudyPeriodInfo => period != null),
    };
  });
}

function applyDraftToPlan(plan: Plan, draft: Map<string, string[]>): Plan {
  if (draft.size === 0) return plan;

  return {
    ...plan,
    courseUnitSelections: plan.courseUnitSelections.map((selection) =>
      draft.has(selection.courseUnitId)
        ? { ...selection, plannedPeriods: draft.get(selection.courseUnitId) ?? [] }
        : selection,
    ),
  };
}

function getSortedPeriods(periodMap: Map<string, StudyPeriodInfo>): StudyPeriodInfo[] {
  return [...periodMap.values()].sort((first, second) => first.startDate.localeCompare(second.startDate));
}

function getTargetPeriodLocators(
  periodLocator: string,
  periodCount: number,
  periodMap: Map<string, StudyPeriodInfo>,
): string[] {
  const periods = getSortedPeriods(periodMap);
  const targetIndex = periods.findIndex((period) => period.locator === periodLocator);
  if (targetIndex < 0) return [periodLocator];

  const duration = Math.min(Math.max(periodCount, 1), periods.length);
  const startIndex = Math.min(targetIndex, Math.max(periods.length - duration, 0));

  return periods.slice(startIndex, startIndex + duration).map((period) => period.locator);
}

function getMoveLocators(
  sourceData: unknown,
  targetData: unknown,
  periodMap: Map<string, StudyPeriodInfo>,
): string[] | null {
  if (!isTimelineCourseDragData(sourceData) || !isTimelineDropData(targetData)) return null;
  if (targetData.kind === 'timeline-pool') return [];
  return getTargetPeriodLocators(targetData.periodLocator, sourceData.periodCount, periodMap);
}

function getCourseStartDate(course: TimelineCourse): string | null {
  const startDates = course.plannedPeriods.map((period) => period.startDate);
  if (startDates.length === 0) return null;
  return startDates.reduce((earliest, current) => (current < earliest ? current : earliest));
}

function getCourseEndDate(course: TimelineCourse): string | null {
  const endDates = course.plannedPeriods.map((period) => period.endDate);
  if (endDates.length === 0) return null;
  return endDates.reduce((latest, current) => (current > latest ? current : latest));
}

function getPassedCourseUnitGroupIds(attainments: CourseUnitAttainmentRestricted[]): Set<string> {
  return new Set(
    attainments
      .filter((attainment) => attainment.primary === true && attainment.state !== 'FAILED')
      .map((attainment) => attainment.courseUnitGroupId),
  );
}

function getCourseLabel(course: TimelineCourse): string {
  return course.courseCode ?? course.courseName ?? 'Required course';
}

function getPlannedPrerequisiteCourse(
  courseUnitGroupId: string,
  courses: TimelineCourse[],
  courseStartDate: string,
): TimelineCourse | null {
  return (
    courses.find((course) => {
      if (course.courseUnitGroupId !== courseUnitGroupId) return false;
      const prerequisiteEndDate = getCourseEndDate(course);
      return prerequisiteEndDate != null && prerequisiteEndDate <= courseStartDate;
    }) ?? null
  );
}

function getCourseByGroupId(courseUnitGroupId: string, courses: TimelineCourse[]): TimelineCourse | null {
  return courses.find((course) => course.courseUnitGroupId === courseUnitGroupId) ?? null;
}

function isPrerequisiteSatisfied(
  courseUnitGroupId: string,
  courses: TimelineCourse[],
  courseStartDate: string,
  passedCourseUnitGroupIds: Set<string>,
): boolean {
  return (
    passedCourseUnitGroupIds.has(courseUnitGroupId) ||
    getPlannedPrerequisiteCourse(courseUnitGroupId, courses, courseStartDate) != null
  );
}

function getValidationWarnings(
  courses: TimelineCourse[],
  prereqMap: Map<string, PrerequisiteInfo>,
  attainments: CourseUnitAttainmentRestricted[],
): Map<string, TimelineValidationWarning[]> {
  const warnings = new Map<string, TimelineValidationWarning[]>();
  const passedCourseUnitGroupIds = getPassedCourseUnitGroupIds(attainments);

  const addWarning = (courseUnitId: string, warning: TimelineValidationWarning) => {
    const existing = warnings.get(courseUnitId) ?? [];
    warnings.set(courseUnitId, [...existing, warning]);
  };

  for (const course of courses) {
    if (course.isPassed || course.plannedPeriods.length === 0) continue;

    if (course.teachingPeriodLocators.length > 0) {
      const teachingPeriodLocators = new Set(course.teachingPeriodLocators);
      const invalidPeriods = course.plannedPeriods.filter((period) => !teachingPeriodLocators.has(period.locator));
      if (invalidPeriods.length > 0) {
        addWarning(course.courseUnitId, {
          id: `period:${course.courseUnitId}:${invalidPeriods.map((period) => period.locator).join(':')}`,
          message: `Not organized in ${invalidPeriods.map((period) => period.name).join(', ')}.`,
          type: 'period',
        });
      }
    }

    const prereq = prereqMap.get(course.courseUnitId);
    const courseStartDate = getCourseStartDate(course);
    if (!prereq || !courseStartDate) continue;

    const compulsoryOptions = prereq.compulsory.filter((group) => group.prerequisites.length > 0);
    const hasSatisfiedOption =
      compulsoryOptions.length === 0 ||
      compulsoryOptions.some((group) =>
        group.prerequisites.every((prerequisite) =>
          isPrerequisiteSatisfied(prerequisite.courseUnitGroupId, courses, courseStartDate, passedCourseUnitGroupIds),
        ),
      );
    if (hasSatisfiedOption) continue;

    const optionWarnings = compulsoryOptions.map((group) =>
      group.prerequisites.filter(
        (prerequisite) =>
          !isPrerequisiteSatisfied(prerequisite.courseUnitGroupId, courses, courseStartDate, passedCourseUnitGroupIds),
      ),
    );
    const bestOptionMissing = optionWarnings.reduce((best, current) => (current.length < best.length ? current : best));

    for (const prerequisite of bestOptionMissing) {
      const prerequisiteCourse = getCourseByGroupId(prerequisite.courseUnitGroupId, courses);
      const prerequisiteLabel = prerequisiteCourse
        ? getCourseLabel(prerequisiteCourse)
        : (prerequisite.name ?? 'a required course');
      addWarning(course.courseUnitId, {
        id: `prerequisite:${course.courseUnitId}:${prerequisite.courseUnitGroupId}`,
        message: `${prerequisiteLabel} must be completed before this course.`,
        type: 'prerequisite',
      });
    }
  }

  return warnings;
}

const TimelineView: React.FC = () => {
  const { planId } = useParams();
  const queryClient = useQueryClient();
  const [activeDragCourseId, setActiveDragCourseId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAutoScheduling, setIsAutoScheduling] = useState(false);
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
  const validationWarnings = useMemo(
    () =>
      getValidationWarnings(
        draftTimelineCourses,
        prerequisiteQuery.data ?? new Map(),
        (attainmentsQuery.data ?? []).filter(isCourseUnitAttainment),
      ),
    [attainmentsQuery.data, draftTimelineCourses, prerequisiteQuery.data],
  );
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
    onSuccess: async (updatedPlan) => {
      queryClient.setQueryData<Plan[]>(
        ['plans'],
        (plans) => plans?.map((plan) => (plan.id === updatedPlan.id ? updatedPlan : plan)) ?? [updatedPlan],
      );
      queryClient.setQueryData<TimelineCourse[]>(
        ['timeline-courses', selectedPlanId],
        applyDraftToCourses(timelineCourses, draftPeriodsByCourseId, studyPeriodMap),
      );
      setDraftPeriodsByCourseId(new Map());
      setDismissedPrerequisiteWarningIds(new Set());
      await new Promise((resolve) => window.setTimeout(resolve, 1500));
      await queryClient.invalidateQueries({ queryKey: ['plans'] });
      await queryClient.invalidateQueries({ queryKey: ['timeline-courses', selectedPlanId] });
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
          draftTimelineCourses.find((course) => course.moduleId === moduleId)?.moduleName ?? 'Unknown module',
      ),
    [draftTimelineCourses, moduleIds],
  );

  const unscheduledCourses = useMemo(
    () =>
      draftTimelineCourses.filter(
        (course) => course.plannedPeriods.length === 0 && !course.completionPeriod?.visibleByDefault,
      ),
    [draftTimelineCourses],
  );

  const semesters = useMemo(() => {
    const periods = getCreditsByPeriod(draftTimelineCourses, studyPeriodMap);
    return getVisibleSemesters(
      getCreditsBySemester(
        periods.filter((period) => period.period.visibleByDefault || period.courses.some((course) => !course.isPassed)),
      ),
    );
  }, [draftTimelineCourses, studyPeriodMap]);

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

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100dvh-48px)] items-center justify-center">
        <InlineLoader />
      </div>
    );
  }

  if (!planId && selectedPlanId) {
    return <Navigate to={`/student/plan/${selectedPlanId}/timing`} replace />;
  }

  return (
    <DragDropProvider onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="-mx-6 -mt-6 flex h-[calc(100dvh-41px)] flex-col overflow-hidden bg-background text-offwhite">
        <TimelineToolbar
          moduleNames={moduleNames}
          autoScheduleDisabled={!selectedPlanId || draftTimelineCourses.length === 0}
          autoSchedulePending={isAutoScheduling}
          confirmDisabled={draftPeriodsByCourseId.size === 0 || prerequisiteQuery.isLoading || validationIssueCount > 0}
          confirmPending={confirmTimeline.isPending}
          onAutoSchedule={handleAutoSchedule}
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
            isDragging={isDragging}
            unscheduledCourses={unscheduledCourses}
            moduleIds={moduleIds}
            onDismissValidationWarning={(warningId) =>
              setDismissedPrerequisiteWarningIds((current) => new Set(current).add(warningId))
            }
            validationWarnings={visibleValidationWarnings}
          />
          <TimelineBoard
            draftCourseIds={draftCourseIds}
            highlightedPeriodLocators={highlightedPeriodLocators}
            isDragging={isDragging}
            semesters={semesters}
            moduleIds={moduleIds}
            onDismissValidationWarning={(warningId) =>
              setDismissedPrerequisiteWarningIds((current) => new Set(current).add(warningId))
            }
            validationWarnings={visibleValidationWarnings}
          />
        </div>
      </div>
    </DragDropProvider>
  );
};

export default TimelineView;
