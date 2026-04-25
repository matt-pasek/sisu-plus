import React, { useMemo } from 'react';
import { Navigate, useParams } from 'react-router';
import { fetchPlans } from '@/app/api/endpoints/plans';
import { getTimelineCourses } from '@/app/api/dataPoints/getTimelineCourses';
import { getStudyPeriodMap } from '@/app/api/dataPoints/getStudyPeriodMap';
import { getCreditsByPeriod, getCreditsBySemester } from '@/app/api/dataPoints/getCreditsByPeriod';
import { InlineLoader } from '@/app/components/ui/InlineLoader.comp';
import { useSisuQuery } from '@/app/hooks/useSisuQuery';
import { TimelineToolbar } from '@/app/views/timeline/components/TimelineToolbar.comp';
import { TimelineCoursePool } from '@/app/views/timeline/components/TimelineCoursePool.comp';
import { TimelineBoard } from '@/app/views/timeline/components/TimelineBoard.comp';
import { getVisibleSemesters } from '@/app/views/timeline/components/timelineUtils';

const TimelineView: React.FC = () => {
  const { planId } = useParams();
  const plansQuery = useSisuQuery(['plans'], fetchPlans);
  const selectedPlan =
    plansQuery.data?.find((plan) => plan.id === planId) ??
    plansQuery.data?.find((plan) => plan.primary) ??
    plansQuery.data?.[0];
  const selectedPlanId = selectedPlan?.id;
  const { timelineCourses, isLoading: coursesLoading } = getTimelineCourses(selectedPlanId);
  const { studyPeriodMap, isLoading: periodsLoading } = getStudyPeriodMap();
  const isLoading = plansQuery.isLoading || coursesLoading || periodsLoading;

  const moduleIds = useMemo(
    () => [
      ...new Set(
        timelineCourses.map((course) => course.moduleId).filter((moduleId): moduleId is string => moduleId != null),
      ),
    ],
    [timelineCourses],
  );

  const moduleNames = useMemo(
    () =>
      moduleIds.map(
        (moduleId) => timelineCourses.find((course) => course.moduleId === moduleId)?.moduleName ?? 'Unknown module',
      ),
    [moduleIds, timelineCourses],
  );

  const unscheduledCourses = useMemo(
    () =>
      timelineCourses.filter(
        (course) => course.plannedPeriods.length === 0 && !course.completionPeriod?.visibleByDefault,
      ),
    [timelineCourses],
  );

  const semesters = useMemo(() => {
    const periods = getCreditsByPeriod(timelineCourses, studyPeriodMap);
    return getVisibleSemesters(
      getCreditsBySemester(
        periods.filter((period) => period.period.visibleByDefault || period.courses.some((course) => !course.isPassed)),
      ),
    );
  }, [studyPeriodMap, timelineCourses]);

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
    <div className="-mx-6 -mt-6 flex h-[calc(100dvh-41px)] flex-col overflow-hidden bg-background text-offwhite">
      <TimelineToolbar moduleNames={moduleNames} />
      <div className="flex min-h-0 flex-1">
        <TimelineCoursePool unscheduledCourses={unscheduledCourses} moduleIds={moduleIds} />
        <TimelineBoard semesters={semesters} moduleIds={moduleIds} />
      </div>
    </div>
  );
};

export default TimelineView;
