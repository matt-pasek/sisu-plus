import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePlan } from '@/app/api/endpoints/updatePlan';
import type { StudyPeriodMap } from '@/app/api/dataPoints/getStudyPeriodMap';
import type { TimelineCourse } from '@/app/api/dataPoints/getTimelineCourses';
import type { Plan } from '@/app/api/generated/OsuvaApi';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { applyDraftToCourses, applyDraftToPlan } from '@/app/views/timeline/util';

interface UseConfirmTimelineArgs {
  plan: Plan | undefined;
  draft: Map<string, string[]>;
  timelineCourses: TimelineCourse[];
  studyPeriodMap: StudyPeriodMap;
  onSaved: () => void;
}

export const useConfirmTimeline = ({
  plan,
  draft,
  timelineCourses,
  studyPeriodMap,
  onSaved,
}: UseConfirmTimelineArgs) => {
  const { i18n } = useTranslationWithPrefix('views.timeline');
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const planId = plan?.id;
      if (!plan || !planId) throw new Error('Plan not found.');
      return updatePlan(planId, applyDraftToPlan(plan, draft));
    },
    onSuccess: (updatedPlan) => {
      const lang = i18n.language;
      queryClient.setQueryData<Plan[]>(
        ['plans', lang],
        (plans) => plans?.map((existing) => (existing.id === updatedPlan.id ? updatedPlan : existing)) ?? [updatedPlan],
      );
      queryClient.setQueryData<TimelineCourse[]>(
        ['timeline-courses', plan?.id, lang],
        applyDraftToCourses(timelineCourses, draft, studyPeriodMap),
      );
      onSaved();
    },
  });
};
