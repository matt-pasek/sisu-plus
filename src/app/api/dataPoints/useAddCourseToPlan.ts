import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  addCourseSelection,
  assertCourseAddable,
  assertModuleInPlan,
  type CourseSelectionInput,
} from '@/app/api/dataPoints/addCourseSelection';
import type { TimelineCourse } from '@/app/api/dataPoints/getTimelineCourses';
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
  getCachedCourseGroupIds,
  insertTimelineCourse,
  invalidatePlanWrite,
  restoreTimelineCourses,
  snapshotTimelineCourses,
  updateTimelineCourses,
  type TimelineCoursesSnapshot,
} from '@/app/api/dataPoints/timelineCoursesCache';
import { updatePlan } from '@/app/api/endpoints/updatePlan';
import type { Plan } from '@/app/api/generated/OsuvaApi';

export interface AddCourseArgs extends CourseSelectionInput {
  planId: string;
  optimisticCourse?: TimelineCourse;
}

interface AddCourseContext {
  snapshot: PlansSnapshot;
  coursesSnapshot: TimelineCoursesSnapshot;
}

export function useAddCourseToPlan() {
  const queryClient = useQueryClient();

  return useMutation<Plan, Error, AddCourseArgs, AddCourseContext>({
    mutationKey: PLAN_WRITE_KEY,
    scope: PLAN_WRITE_SCOPE,
    mutationFn: async (args) => {
      const plan = findCachedPlan(queryClient, args.planId);
      if (!plan) throw new Error('Plan not found.');
      assertModuleInPlan(plan, args.parentModuleId);

      return updatePlan(args.planId, addCourseSelection(plan, args));
    },
    onMutate: async (args) => {
      await queryClient.cancelQueries({ queryKey: ['plans'] });
      await queryClient.cancelQueries({ queryKey: ['timeline-courses', args.planId] });

      // Checked before the optimistic copy exists: mutationFn sees that copy, so it has to stay idempotent.
      const plan = findCachedPlan(queryClient, args.planId);
      if (plan) {
        const selectedIds = new Set(plan.courseUnitSelections.map((selection) => selection.courseUnitId));
        assertCourseAddable(plan, args, getCachedCourseGroupIds(queryClient, args.planId, selectedIds));
      }

      const snapshot = snapshotPlans(queryClient);
      const coursesSnapshot = snapshotTimelineCourses(queryClient, args.planId);
      updateCachedPlan(queryClient, args.planId, (cached) => addCourseSelection(cached, args));

      const { optimisticCourse } = args;
      if (optimisticCourse) {
        updateTimelineCourses(queryClient, args.planId, (courses) => insertTimelineCourse(courses, optimisticCourse));
      }

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
