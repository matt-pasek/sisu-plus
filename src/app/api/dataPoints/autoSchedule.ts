import type { TimelineCourse } from '@/app/api/dataPoints/getTimelineCourses';
import type { StudyPeriodInfo, StudyPeriodMap } from '@/app/api/dataPoints/getStudyPeriodMap';
import type { CourseUnitAttainmentRestricted } from '@/app/api/generated/OriApi';
import type { PrerequisiteInfo } from '@/app/api/resolvers/resolvePrerequisites';

export interface AutoScheduleOptions {
  courses: TimelineCourse[];
  periodMap: StudyPeriodMap;
  attainments: CourseUnitAttainmentRestricted[];
  prereqMap: Map<string, PrerequisiteInfo>;
  maxCreditsPerPeriod?: number;
  startFromPeriodLocator?: string;
}

export interface AutoScheduleResult {
  assignments: Map<string, string[]>;
  warnings: { courseUnitId: string; reason: string }[];
}

const DEFAULT_MAX_CREDITS_PER_PERIOD = 15;

function getCourseCredits(course: TimelineCourse): number {
  return course.credits ?? 0;
}

function getSortedPeriods(periodMap: StudyPeriodMap): StudyPeriodInfo[] {
  return [...periodMap.values()].sort((a, b) => a.startDate.localeCompare(b.startDate));
}

function getStartPeriodIndex(periods: StudyPeriodInfo[], startFromPeriodLocator: string | undefined): number {
  if (startFromPeriodLocator) {
    const explicitIndex = periods.findIndex((period) => period.locator === startFromPeriodLocator);
    if (explicitIndex >= 0) return explicitIndex;
  }

  const today = new Date().toISOString().slice(0, 10);
  const currentIndex = periods.findIndex((period) => today >= period.startDate && today < period.endDate);
  if (currentIndex >= 0) return currentIndex;

  const futureIndex = periods.findIndex((period) => period.startDate >= today);
  return Math.max(futureIndex, 0);
}

function getPassedCourseUnitGroupIds(attainments: CourseUnitAttainmentRestricted[]): Set<string> {
  return new Set(
    attainments
      .filter((attainment) => attainment.primary === true && attainment.state !== 'FAILED')
      .map((attainment) => attainment.courseUnitGroupId),
  );
}

function getRequiredCourseUnitGroupIds(prereq: PrerequisiteInfo | undefined): string[] {
  if (!prereq) return [];
  const firstOption = prereq.compulsory.find((group) => group.prerequisites.length > 0);
  return firstOption?.prerequisites.map((item) => item.courseUnitGroupId) ?? [];
}

function getCourseUnitGroupId(course: TimelineCourse): string {
  return course.courseUnitGroupId ?? course.courseUnitId;
}

function getDependencyCourseIds(
  course: TimelineCourse,
  prereqMap: Map<string, PrerequisiteInfo>,
  courseIdByGroupId: Map<string, string>,
): string[] {
  return getRequiredCourseUnitGroupIds(prereqMap.get(course.courseUnitId))
    .map((courseUnitGroupId) => courseIdByGroupId.get(courseUnitGroupId))
    .filter((courseUnitId): courseUnitId is string => courseUnitId != null);
}

function getPrerequisiteDepth(
  course: TimelineCourse,
  prereqMap: Map<string, PrerequisiteInfo>,
  coursesById: Map<string, TimelineCourse>,
  visiting = new Set<string>(),
  visited = new Map<string, number>(),
): number {
  const cached = visited.get(course.courseUnitId);
  if (cached != null) return cached;

  if (visiting.has(course.courseUnitId)) return 0;
  visiting.add(course.courseUnitId);

  const courseIdByGroupId = new Map(
    [...coursesById.values()].map((candidate) => [getCourseUnitGroupId(candidate), candidate.courseUnitId]),
  );
  const dependencies = getDependencyCourseIds(course, prereqMap, courseIdByGroupId)
    .map((dependencyId) => coursesById.get(dependencyId))
    .filter((dependency): dependency is TimelineCourse => dependency != null);
  const depth =
    dependencies.length === 0
      ? 0
      : Math.max(
          ...dependencies.map((dependency) =>
            getPrerequisiteDepth(dependency, prereqMap, coursesById, visiting, visited),
          ),
        ) + 1;

  visiting.delete(course.courseUnitId);
  visited.set(course.courseUnitId, depth);
  return depth;
}

function getPeriodIndexByLocator(periods: StudyPeriodInfo[]): Map<string, number> {
  return new Map(periods.map((period, index) => [period.locator, index]));
}

function getLatestScheduledDependencyIndex(
  course: TimelineCourse,
  prereqMap: Map<string, PrerequisiteInfo>,
  assignmentsByGroupId: Map<string, string[]>,
  periodIndexByLocator: Map<string, number>,
): number {
  const prereq = prereqMap.get(course.courseUnitId);
  const dependencyGroupIds =
    prereq?.compulsory
      .find((group) => group.prerequisites.every((item) => assignmentsByGroupId.has(item.courseUnitGroupId)))
      ?.prerequisites.map((item) => item.courseUnitGroupId) ?? getRequiredCourseUnitGroupIds(prereq);
  let latest = -1;

  for (const dependencyGroupId of dependencyGroupIds) {
    const dependencyPeriods = assignmentsByGroupId.get(dependencyGroupId);
    if (!dependencyPeriods) continue;

    for (const locator of dependencyPeriods) {
      const index = periodIndexByLocator.get(locator);
      if (index != null) latest = Math.max(latest, index);
    }
  }

  return latest;
}

function getUnresolvedPrerequisites(
  course: TimelineCourse,
  prereqMap: Map<string, PrerequisiteInfo>,
  passedCourseUnitGroupIds: Set<string>,
  assignmentsByGroupId: Map<string, string[]>,
): string[] {
  const options = (prereqMap.get(course.courseUnitId)?.compulsory ?? []).filter(
    (group) => group.prerequisites.length > 0,
  );
  if (options.length === 0) return [];

  const unresolvedByOption = options.map((group) =>
    group.prerequisites
      .filter(
        (prerequisite) =>
          !passedCourseUnitGroupIds.has(prerequisite.courseUnitGroupId) &&
          !assignmentsByGroupId.has(prerequisite.courseUnitGroupId),
      )
      .map((prerequisite) => prerequisite.courseUnitGroupId),
  );
  if (unresolvedByOption.some((unresolved) => unresolved.length === 0)) return [];

  return unresolvedByOption.reduce((best, current) => (current.length < best.length ? current : best));
}

export function autoSchedule({
  courses,
  periodMap,
  attainments,
  prereqMap,
  maxCreditsPerPeriod = DEFAULT_MAX_CREDITS_PER_PERIOD,
  startFromPeriodLocator,
}: AutoScheduleOptions): AutoScheduleResult {
  const periods = getSortedPeriods(periodMap);
  const startIndex = getStartPeriodIndex(periods, startFromPeriodLocator);
  const periodIndexByLocator = getPeriodIndexByLocator(periods);
  const coursesById = new Map(courses.map((course) => [course.courseUnitId, course]));
  const passedCourseUnitGroupIds = getPassedCourseUnitGroupIds(attainments);
  const assignments = new Map<string, string[]>();
  const assignmentsByGroupId = new Map<string, string[]>();
  const warnings: AutoScheduleResult['warnings'] = [];
  const periodCredits = new Map<string, number>();

  for (const course of courses) {
    if (course.isPassed) continue;
    if (course.isEnrolled && course.plannedPeriods.length > 0) {
      const locators = course.plannedPeriods.map((period) => period.locator);
      assignments.set(course.courseUnitId, locators);
      assignmentsByGroupId.set(getCourseUnitGroupId(course), locators);
      for (const locator of locators) {
        periodCredits.set(locator, (periodCredits.get(locator) ?? 0) + getCourseCredits(course) / locators.length);
      }
    }
  }

  const sortedCourses = courses
    .filter((course) => !course.isPassed && !assignments.has(course.courseUnitId))
    .sort((a, b) => {
      const depthDiff =
        getPrerequisiteDepth(a, prereqMap, coursesById) - getPrerequisiteDepth(b, prereqMap, coursesById);
      if (depthDiff !== 0) return depthDiff;
      return (a.courseName ?? '').localeCompare(b.courseName ?? '');
    });

  for (const course of sortedCourses) {
    if (course.isEnrolled && course.plannedPeriods.length === 0) {
      warnings.push({ courseUnitId: course.courseUnitId, reason: 'Currently enrolled course has no existing period.' });
      continue;
    }

    const unresolvedPrerequisites = getUnresolvedPrerequisites(
      course,
      prereqMap,
      passedCourseUnitGroupIds,
      assignmentsByGroupId,
    );
    if (unresolvedPrerequisites.length > 0) {
      warnings.push({
        courseUnitId: course.courseUnitId,
        reason: `Missing prerequisite scheduling data: ${unresolvedPrerequisites.join(', ')}`,
      });
      continue;
    }

    const latestDependencyIndex = getLatestScheduledDependencyIndex(
      course,
      prereqMap,
      assignmentsByGroupId,
      periodIndexByLocator,
    );
    const earliestIndex = Math.max(startIndex, latestDependencyIndex + 1);
    const courseCredits = getCourseCredits(course);
    const targetPeriod = periods
      .slice(earliestIndex)
      .find((period) => (periodCredits.get(period.locator) ?? 0) + courseCredits <= maxCreditsPerPeriod);

    if (!targetPeriod) {
      warnings.push({ courseUnitId: course.courseUnitId, reason: 'No period has enough remaining credit budget.' });
      continue;
    }

    assignments.set(course.courseUnitId, [targetPeriod.locator]);
    assignmentsByGroupId.set(getCourseUnitGroupId(course), [targetPeriod.locator]);
    periodCredits.set(targetPeriod.locator, (periodCredits.get(targetPeriod.locator) ?? 0) + courseCredits);
  }

  return { assignments, warnings };
}
