import type { TimelineCourse } from '@/app/api/dataPoints/getTimelineCourses';
import type { CourseUnitAttainmentRestricted } from '@/app/api/generated/OriApi';
import type { PrerequisiteGroup, PrerequisiteInfo } from '@/app/api/resolvers/resolvePrerequisites';

export interface PrerequisiteCheckResult {
  courseUnitId: string;
  satisfied: boolean;
  missing: string[];
  recommended_missing: string[];
}

function getPassedCourseUnitGroupIds(attainments: CourseUnitAttainmentRestricted[]): Set<string> {
  return new Set(
    attainments
      .filter((attainment) => attainment.state !== 'FAILED' && attainment.primary === true)
      .map((attainment) => attainment.courseUnitGroupId),
  );
}

function getMissingCourseUnitGroupIds(groups: PrerequisiteGroup[], passedCourseUnitGroupIds: Set<string>): string[] {
  const options = groups.filter((group) => group.prerequisites.length > 0);
  if (options.length === 0) return [];

  const missingByOption = options.map((group) =>
    group.prerequisites
      .filter((prerequisite) => !passedCourseUnitGroupIds.has(prerequisite.courseUnitGroupId))
      .map((prerequisite) => prerequisite.courseUnitGroupId),
  );
  if (missingByOption.some((missing) => missing.length === 0)) return [];

  return missingByOption.reduce((best, current) => (current.length < best.length ? current : best));
}

export function checkPrerequisites(
  course: TimelineCourse,
  prereqs: PrerequisiteInfo,
  attainments: CourseUnitAttainmentRestricted[],
): PrerequisiteCheckResult {
  const passedCourseUnitGroupIds = getPassedCourseUnitGroupIds(attainments);
  const missing = getMissingCourseUnitGroupIds(prereqs.compulsory, passedCourseUnitGroupIds);
  const recommendedMissing = getMissingCourseUnitGroupIds(prereqs.recommended, passedCourseUnitGroupIds);

  return {
    courseUnitId: course.courseUnitId,
    satisfied: missing.length === 0,
    missing,
    recommended_missing: recommendedMissing,
  };
}
