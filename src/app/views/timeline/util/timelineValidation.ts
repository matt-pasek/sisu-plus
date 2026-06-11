import { TimelineCourse } from '@/app/api/dataPoints/getTimelineCourses';
import { PrerequisiteInfo } from '@/app/api/resolvers/resolvePrerequisites';
import { CourseUnitAttainmentRestricted } from '@/app/api/generated/OriApi';
import { getCourseEndDate, getCourseStartDate } from '@/app/views/timeline/util/timelineCourseDate';

export type TimelineValidationWarningType = 'period' | 'prerequisite';

export interface TimelineValidationWarning {
  id: string;
  message: string;
  type: TimelineValidationWarningType;
}

export const getPassedCourseUnitGroupIds = (attainments: CourseUnitAttainmentRestricted[]) =>
  new Set(
    attainments
      .filter((attainment) => attainment.primary && attainment.state !== 'FAILED')
      .map((attainment) => attainment.courseUnitGroupId),
  );

export const getCourseLabel = (course: TimelineCourse, requiredCourseLabel: string) =>
  course.courseCode ?? course.courseName ?? requiredCourseLabel;

export const getPlannedPrerequisiteCourse = (
  courseUnitGroupId: string,
  courses: TimelineCourse[],
  courseStartDate: string,
) =>
  courses.find((course) => {
    if (course.courseUnitGroupId !== courseUnitGroupId) return false;
    const prerequisiteEndDate = getCourseEndDate(course);
    return prerequisiteEndDate != null && prerequisiteEndDate <= courseStartDate;
  }) ?? null;

export const getCourseByGroupId = (courseUnitGroupId: string, courses: TimelineCourse[]) =>
  courses.find((course) => course.courseUnitGroupId === courseUnitGroupId) ?? null;

export const isPrerequisiteSatisfied = (
  courseUnitGroupId: string,
  courses: TimelineCourse[],
  courseStartDate: string,
  passedCourseUnitGroupIds: Set<string>,
) =>
  passedCourseUnitGroupIds.has(courseUnitGroupId) ||
  getPlannedPrerequisiteCourse(courseUnitGroupId, courses, courseStartDate) != null;

export const getValidationWarnings = (
  courses: TimelineCourse[],
  prereqMap: Map<string, PrerequisiteInfo>,
  attainments: CourseUnitAttainmentRestricted[],
) => {
  const warnings = new Map<string, TimelineValidationWarning[]>();
  const passedCourseUnitGroupIds = getPassedCourseUnitGroupIds(attainments);

  const addWarning = (courseUnitId: string, warning: TimelineValidationWarning) => {
    const existing = warnings.get(courseUnitId) ?? [];
    warnings.set(courseUnitId, [...existing, warning]);
  };

  for (const course of courses) {
    if (course.isPassed || course.plannedPeriods.length === 0) continue;

    if (course.teachingPeriodLocators.length > 0) {
      const teachingPeriodLocators = new Set(course.teachingPeriodLocators);
      const invalidPeriods = course.plannedPeriods.filter((period) => !teachingPeriodLocators.has(period.locator));
      if (invalidPeriods.length > 0) {
        addWarning(course.courseUnitId, {
          id: `period:${course.courseUnitId}:${invalidPeriods.map((period) => period.locator).join(':')}`,
          message: '',
          type: 'period',
        });
      }
    }

    const prereq = prereqMap.get(course.courseUnitId);
    const courseStartDate = getCourseStartDate(course);
    if (!prereq || !courseStartDate) continue;

    const compulsoryOptions = prereq.compulsory.filter((group) => group.prerequisites.length > 0);
    const hasSatisfiedOption =
      compulsoryOptions.length === 0 ||
      compulsoryOptions.some((group) =>
        group.prerequisites.every((prerequisite) =>
          isPrerequisiteSatisfied(prerequisite.courseUnitGroupId, courses, courseStartDate, passedCourseUnitGroupIds),
        ),
      );
    if (hasSatisfiedOption) continue;

    const optionWarnings = compulsoryOptions.map((group) =>
      group.prerequisites.filter(
        (prerequisite) =>
          !isPrerequisiteSatisfied(prerequisite.courseUnitGroupId, courses, courseStartDate, passedCourseUnitGroupIds),
      ),
    );
    const bestOptionMissing = optionWarnings.reduce((best, current) => (current.length < best.length ? current : best));

    for (const prerequisite of bestOptionMissing) {
      const prerequisiteCourse = getCourseByGroupId(prerequisite.courseUnitGroupId, courses);
      const prerequisiteLabel = prerequisiteCourse
        ? getCourseLabel(prerequisiteCourse, 'a required course')
        : (prerequisite.name ?? 'a required course');
      addWarning(course.courseUnitId, {
        id: `prerequisite:${course.courseUnitId}:${prerequisite.courseUnitGroupId}`,
        message: prerequisiteLabel,
        type: 'prerequisite',
      });
    }
  }

  return warnings;
};
