import type { Attainment } from '@/app/api/endpoints/attainments';
import type { AssessmentItemAttainmentRestricted, CourseUnitAttainmentRestricted } from '@/app/api/generated/OriApi';

export type CompletionKind = 'course' | 'assessmentItem';

export interface RecentCompletion {
  attainment: CourseUnitAttainmentRestricted | AssessmentItemAttainmentRestricted;
  kind: CompletionKind;
}

const isCounted = (attainment: Attainment) => attainment.primary && attainment.state !== 'FAILED';

const isCourse = (attainment: Attainment): attainment is CourseUnitAttainmentRestricted =>
  attainment.type === 'CourseUnitAttainment';

const isAssessmentItem = (attainment: Attainment): attainment is AssessmentItemAttainmentRestricted =>
  attainment.type === 'AssessmentItemAttainment';

// Sisu often grades an assessment item before the course completion exists; it shows until that completion arrives.
export const getRecentCompletions = (attainments: Attainment[]): RecentCompletion[] => {
  const courses = attainments.filter(isCourse).filter(isCounted);
  const completedGroups = new Set(courses.map((attainment) => attainment.courseUnitGroupId));
  const pendingItems = attainments
    .filter(isAssessmentItem)
    .filter(isCounted)
    .filter((attainment) => !completedGroups.has(attainment.courseUnitGroupId));

  return [
    ...courses.map((attainment): RecentCompletion => ({ attainment, kind: 'course' })),
    ...pendingItems.map((attainment): RecentCompletion => ({ attainment, kind: 'assessmentItem' })),
  ].sort((a, b) => b.attainment.attainmentDate.localeCompare(a.attainment.attainmentDate));
};
