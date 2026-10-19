import type { StudyPeriodInfo } from '@/app/api/dataPoints/getStudyPeriodMap';
import type { TimelineCourse } from '@/app/api/dataPoints/getTimelineCourses';

export const makePeriod = (partial: Partial<StudyPeriodInfo> & { locator: string }): StudyPeriodInfo => ({
  name: partial.locator,
  startDate: '2026-09-01',
  endDate: '2026-10-31',
  studyYear: 2026,
  termName: 'Autumn',
  visibleByDefault: true,
  ...partial,
});

export const makeCourse = (partial: Partial<TimelineCourse> & { courseUnitId: string }): TimelineCourse => ({
  courseUnitGroupId: null,
  courseCode: null,
  courseName: null,
  credits: null,
  moduleId: null,
  moduleName: null,
  plannedPeriods: [],
  completionPeriod: null,
  attainmentDate: null,
  isPassed: false,
  grade: null,
  isEnrolled: false,
  parentModuleId: null,
  teachingPeriodLocators: [],
  ...partial,
});
