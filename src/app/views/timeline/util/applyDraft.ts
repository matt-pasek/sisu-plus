import type { TimelineCourse } from '@/app/api/dataPoints/getTimelineCourses';
import type { StudyPeriodInfo } from '@/app/api/dataPoints/getStudyPeriodMap';
import type { Plan } from '@/app/api/generated/OsuvaApi';
import { sameLocators } from './courseLocators';

export const stageDraft = (
  current: Map<string, string[]>,
  originalLocators: string[],
  courseUnitId: string,
  newLocators: string[],
) => {
  const next = new Map(current);
  if (sameLocators(originalLocators, newLocators)) {
    next.delete(courseUnitId);
  } else {
    next.set(courseUnitId, newLocators);
  }
  return next;
};

export const applyDraftToCourses = (
  courses: TimelineCourse[],
  draft: Map<string, string[]>,
  periodsByLocator: Map<string, StudyPeriodInfo>,
) => {
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
};

export const applyDraftToPlan = (plan: Plan, draft: Map<string, string[]>) => {
  if (draft.size === 0) return plan;

  return {
    ...plan,
    courseUnitSelections: plan.courseUnitSelections.map((selection) =>
      draft.has(selection.courseUnitId)
        ? { ...selection, plannedPeriods: draft.get(selection.courseUnitId) ?? [] }
        : selection,
    ),
  };
};
