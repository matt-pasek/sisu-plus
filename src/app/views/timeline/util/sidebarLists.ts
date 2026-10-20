import type { TimelineCourse } from '@/app/api/dataPoints/getTimelineCourses';
import type { TimelineValidationWarning } from '@/app/views/timeline/util/timelineValidation';

export interface TimelineModule {
  id: string;
  name: string;
}

export interface TimelineIssue {
  courseUnitId: string;
  courseName: string;
  warning: TimelineValidationWarning;
}

const GENERIC_TRAILING_WORD = /\s+(studies|study|module|opinnot|moduuli)$/i;
const SHORT_NAME_MAX = 14;

export const getShortModuleName = (name: string): string => {
  const trimmed = name.trim();
  const base = trimmed.replace(GENERIC_TRAILING_WORD, '').trim() || trimmed;
  if (base.length <= SHORT_NAME_MAX) return base;
  return base.split(/\s+/)[0].replace(/[-,:;]+$/, '') || base;
};

export const listModules = (courses: TimelineCourse[], unknownLabel: string): TimelineModule[] => {
  const modules = new Map<string, TimelineModule>();
  for (const course of courses) {
    if (!course.moduleId || modules.has(course.moduleId)) continue;
    modules.set(course.moduleId, { id: course.moduleId, name: course.moduleName ?? unknownLabel });
  }
  return [...modules.values()];
};

const getFirstPeriodStart = (course: TimelineCourse): string | null =>
  course.plannedPeriods.reduce<string | null>(
    (earliest, period) => (earliest == null || period.startDate < earliest ? period.startDate : earliest),
    null,
  );

export const listIssues = (
  warnings: Map<string, TimelineValidationWarning[]>,
  courses: TimelineCourse[],
): TimelineIssue[] => {
  const coursesById = new Map(courses.map((course) => [course.courseUnitId, course]));
  const rows = [...warnings.entries()].flatMap(([courseUnitId, courseWarnings]) => {
    const course = coursesById.get(courseUnitId);
    const courseName = course?.courseName ?? course?.courseCode ?? courseUnitId;
    const start = course ? getFirstPeriodStart(course) : null;
    return courseWarnings.map((warning) => ({ start, issue: { courseUnitId, courseName, warning } }));
  });
  return rows
    .map((row, index) => ({ ...row, index }))
    .sort((a, b) => {
      if (a.start !== b.start) {
        if (a.start == null) return 1;
        if (b.start == null) return -1;
        return a.start < b.start ? -1 : 1;
      }
      const byName = a.issue.courseName.localeCompare(b.issue.courseName);
      return byName !== 0 ? byName : a.index - b.index;
    })
    .map(({ issue }) => issue);
};
