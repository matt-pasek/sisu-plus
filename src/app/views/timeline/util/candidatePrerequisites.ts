import type { TimelineCourse } from '@/app/api/dataPoints/getTimelineCourses';
import type { PrerequisiteInfo } from '@/app/api/resolvers/resolvePrerequisites';
import type { CourseUnitAttainmentRestricted } from '@/app/api/generated/OriApi';
import { getCourseEndDate, getCourseStartDate } from '@/app/views/timeline/util/timelineCourseDate';
import {
  getCourseLabel,
  getPassedCourseUnitGroupIds,
  getPlannedPrerequisiteCourse,
  getValidationWarnings,
  isPrerequisiteSatisfied,
} from '@/app/views/timeline/util/timelineValidation';

export interface CandidatePrerequisites {
  unmet: string[];
  plannedOnly: { label: string; periodName: string }[];
}

interface GetCandidatePrerequisitesArgs {
  candidate: TimelineCourse;
  courses: TimelineCourse[];
  prerequisites: PrerequisiteInfo | undefined;
  attainments: CourseUnitAttainmentRestricted[];
}

const EMPTY: CandidatePrerequisites = { unmet: [], plannedOnly: [] };

const getLastPeriodName = (course: TimelineCourse) => {
  const endDate = getCourseEndDate(course);
  return course.plannedPeriods.find((period) => period.endDate === endDate)?.name ?? '';
};

export const getCandidatePrerequisites = ({
  candidate,
  courses,
  prerequisites,
  attainments,
}: GetCandidatePrerequisitesArgs): CandidatePrerequisites => {
  if (!prerequisites) return EMPTY;

  const warnings = getValidationWarnings(
    [candidate, ...courses],
    new Map([[candidate.courseUnitId, prerequisites]]),
    attainments,
  );
  const unmet = (warnings.get(candidate.courseUnitId) ?? [])
    .filter((warning) => warning.type === 'prerequisite')
    .map((warning) => warning.message);

  const startDate = getCourseStartDate(candidate);
  if (!startDate) return { unmet, plannedOnly: [] };

  const passed = getPassedCourseUnitGroupIds(attainments);
  const satisfiedGroup = prerequisites.compulsory.find(
    (group) =>
      group.prerequisites.length > 0 &&
      group.prerequisites.every((prerequisite) =>
        isPrerequisiteSatisfied(prerequisite.courseUnitGroupId, courses, startDate, passed),
      ),
  );
  if (!satisfiedGroup) return { unmet, plannedOnly: [] };

  const plannedOnly = satisfiedGroup.prerequisites
    .filter((prerequisite) => !passed.has(prerequisite.courseUnitGroupId))
    .flatMap((prerequisite) => {
      const course = getPlannedPrerequisiteCourse(prerequisite.courseUnitGroupId, courses, startDate);
      return course ? [{ label: getCourseLabel(course, ''), periodName: getLastPeriodName(course) }] : [];
    });

  return { unmet, plannedOnly };
};
