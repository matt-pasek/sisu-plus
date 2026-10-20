import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  PLAN_WRITE_KEY,
  PLAN_WRITE_SCOPE,
  findCachedPlan,
  restorePlans,
  snapshotPlans,
  updateCachedPlan,
  type PlansSnapshot,
} from '@/app/api/dataPoints/planCache';
import {
  invalidatePlanWrite,
  removeTimelineCourse,
  restoreTimelineCourses,
  snapshotTimelineCourses,
  updateTimelineCourses,
  type TimelineCoursesSnapshot,
} from '@/app/api/dataPoints/timelineCoursesCache';
import { updatePlan } from '@/app/api/endpoints/updatePlan';
import type { Plan } from '@/app/api/generated/OsuvaApi';

export interface RemoveCourseArgs {
  courseUnitId: string;
  planId: string;
}

interface RemoveCourseContext {
  snapshot: PlansSnapshot;
  coursesSnapshot: TimelineCoursesSnapshot;
}

function removeCourseSelection(plan: Plan, courseUnitId: string): Plan {
  return {
    ...plan,
    courseUnitSelections: plan.courseUnitSelections.filter((selection) => selection.courseUnitId !== courseUnitId),
  };
}

export function useRemoveCourseFromPlan() {
  const queryClient = useQueryClient();

  return useMutation<Plan, Error, RemoveCourseArgs, RemoveCourseContext>({
    mutationKey: PLAN_WRITE_KEY,
    scope: PLAN_WRITE_SCOPE,
    mutationFn: async ({ courseUnitId, planId }) => {
      const plan = findCachedPlan(queryClient, planId);
      if (!plan) throw new Error('Plan not found.');

      return updatePlan(planId, removeCourseSelection(plan, courseUnitId));
    },
    onMutate: async ({ courseUnitId, planId }) => {
      await queryClient.cancelQueries({ queryKey: ['plans'] });
      await queryClient.cancelQueries({ queryKey: ['timeline-courses', planId] });

      const snapshot = snapshotPlans(queryClient);
      const coursesSnapshot = snapshotTimelineCourses(queryClient, planId);
      updateCachedPlan(queryClient, planId, (plan) => removeCourseSelection(plan, courseUnitId));
      updateTimelineCourses(queryClient, planId, (courses) => removeTimelineCourse(courses, courseUnitId));

      return { snapshot, coursesSnapshot };
    },
    onError: (_error, _args, context) => {
      if (!context) return;
      restorePlans(queryClient, context.snapshot);
      restoreTimelineCourses(queryClient, context.coursesSnapshot);
    },
    onSettled: async (_data, _error, args) => {
      await invalidatePlanWrite(queryClient, args.planId);
    },
  });
}
