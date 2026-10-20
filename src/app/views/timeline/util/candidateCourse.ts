import type { StudyPeriodInfo } from '@/app/api/dataPoints/getStudyPeriodMap';
import type { TimelineCourse } from '@/app/api/dataPoints/getTimelineCourses';
import type { PlanCourseOption } from '@/app/api/dataPoints/planOptions/buildOptionGroups';

interface ToCandidateCourseArgs {
  option: Pick<PlanCourseOption, 'courseUnitId' | 'courseUnitGroupId' | 'code' | 'name' | 'credits'>;
  sectionId: string;
  sectionName: string;
  parentModuleId: string;
  plannedPeriods: StudyPeriodInfo[];
}

export const toCandidateCourse = ({
  option,
  sectionId,
  sectionName,
  parentModuleId,
  plannedPeriods,
}: ToCandidateCourseArgs): TimelineCourse => ({
  courseUnitId: option.courseUnitId,
  courseUnitGroupId: option.courseUnitGroupId,
  courseCode: option.code,
  courseName: option.name,
  credits: option.credits,
  moduleId: sectionId,
  moduleName: sectionName,
  plannedPeriods,
  completionPeriod: null,
  attainmentDate: null,
  isPassed: false,
  grade: null,
  isEnrolled: false,
  parentModuleId,
  teachingPeriodLocators: [],
});
