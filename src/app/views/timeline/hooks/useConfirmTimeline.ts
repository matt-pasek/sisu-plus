import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { StudyPeriodMap } from '@/app/api/dataPoints/getStudyPeriodMap';
import { PLAN_WRITE_KEY, PLAN_WRITE_SCOPE, findCachedPlan, updateCachedPlan } from '@/app/api/dataPoints/planCache';
import { invalidatePlanWrite, updateTimelineCourses } from '@/app/api/dataPoints/timelineCoursesCache';
import { updatePlan } from '@/app/api/endpoints/updatePlan';
import { applyDraftToCourses, applyDraftToPlan } from '@/app/views/timeline/util';

interface UseConfirmTimelineArgs {
  planId: string | undefined;
  draft: Map<string, string[]>;
  studyPeriodMap: StudyPeriodMap;
  onSaved: () => void;
}

export const useConfirmTimeline = ({ planId, draft, studyPeriodMap, onSaved }: UseConfirmTimelineArgs) => {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  // The mutation stays pending through the follow-up refetch so the next plan write queues behind it;
  // isSaving covers only the PUT, which is what the button label reports.
  const mutation = useMutation({
    mutationKey: PLAN_WRITE_KEY,
    scope: PLAN_WRITE_SCOPE,
    onMutate: () => setIsSaving(true),
    mutationFn: async () => {
      const plan = planId ? findCachedPlan(queryClient, planId) : undefined;
      if (!plan || !planId) throw new Error('Plan not found.');
      return updatePlan(planId, applyDraftToPlan(plan, draft));
    },
    onSuccess: async (updatedPlan) => {
      setIsSaving(false);
      if (!planId) return;
      updateCachedPlan(queryClient, planId, () => updatedPlan);
      updateTimelineCourses(queryClient, planId, (courses) => applyDraftToCourses(courses, draft, studyPeriodMap));
      onSaved();
      await invalidatePlanWrite(queryClient, planId);
    },
    onError: () => setIsSaving(false),
  });

  return { ...mutation, isSaving };
};
