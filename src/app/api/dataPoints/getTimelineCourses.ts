import { fetchAttainments } from '@/app/api/endpoints/attainments';
import { fetchEnrolments } from '@/app/api/endpoints/enrolments';
import { fetchPlans } from '@/app/api/endpoints/plans';
import { getStudyPeriodMap, type StudyPeriodInfo } from '@/app/api/dataPoints/getStudyPeriodMap';
import { resolveCourseUnit } from '@/app/api/resolvers/resolveCourseUnit';
import { resolveModule } from '@/app/api/resolvers/resolveModule';
import { buildCuToTopModuleMap } from '@/app/api/resolvers/helpers/buildCuToTopModuleMap';
import { extractCourseCode } from '@/app/api/resolvers/helpers/extractCourseCode';
import { useSisuQuery } from '@/app/hooks/useSisuQuery';
import type { CourseUnitAttainmentRestricted } from '@/app/api/generated/OriApi';

export interface TimelineCourse {
  courseUnitId: string;
  courseCode: string | null;
  courseName: string | null;
  credits: number | null;
  moduleId: string | null;
  moduleName: string | null;
  plannedPeriods: StudyPeriodInfo[];
  isPassed: boolean;
  grade: number | string | null;
  isEnrolled: boolean;
  parentModuleId: string | null;
}

function isPassingCourseUnitAttainment(attainment: unknown): attainment is CourseUnitAttainmentRestricted {
  const candidate = attainment as Partial<CourseUnitAttainmentRestricted>;
  return candidate.type === 'CourseUnitAttainment' && candidate.primary === true && candidate.state !== 'FAILED';
}

function getGrade(attainment: CourseUnitAttainmentRestricted | undefined): number | string | null {
  if (!attainment) return null;

  if (attainment.gradeScaleId.includes('hyl-hyv')) {
    return attainment.gradeId != null ? 'Pass' : 'Fail';
  }

  return attainment.gradeId >= 1 && attainment.gradeId <= 5 ? attainment.gradeId : null;
}

export const getTimelineCourses = (): { timelineCourses: TimelineCourse[]; isLoading: boolean } => {
  const plansQuery = useSisuQuery(['plans'], fetchPlans);
  const attainmentsQuery = useSisuQuery(['attainments'], fetchAttainments);
  const enrolmentsQuery = useSisuQuery(['enrolments'], fetchEnrolments);
  const { studyPeriodMap, isLoading: studyPeriodMapLoading } = getStudyPeriodMap();

  const { data: timelineCourses, isLoading } = useSisuQuery(
    ['timeline-courses'],
    async () => {
      const plan = plansQuery.data![0];
      if (!plan) return [];

      const cuToTopModule = buildCuToTopModuleMap(plan);
      const courseUnitIds = plan.courseUnitSelections.map((selection) => selection.courseUnitId);
      const topModuleIds = [...new Set([...cuToTopModule.values()])];

      const courseUnitEntries = await Promise.all(
        courseUnitIds.map(async (courseUnitId) => [courseUnitId, await resolveCourseUnit(courseUnitId)] as const),
      );
      const moduleEntries = await Promise.all(
        topModuleIds.map(async (moduleId) => [moduleId, await resolveModule(moduleId)] as const),
      );

      const courseUnitsById = new Map(courseUnitEntries);
      const modulesById = new Map(moduleEntries);

      const passedByUnit = new Map<string, CourseUnitAttainmentRestricted>();
      for (const attainment of attainmentsQuery.data ?? []) {
        if (isPassingCourseUnitAttainment(attainment)) {
          passedByUnit.set(attainment.courseUnitId, attainment);
        }
      }

      const enrolledCourseUnits = new Set(
        (enrolmentsQuery.data ?? [])
          .filter((enrolment) => enrolment.state === 'ENROLLED' || enrolment.state === 'CONFIRMED')
          .map((enrolment) => enrolment.courseUnitId),
      );

      return plan.courseUnitSelections.map((selection): TimelineCourse => {
        const courseUnit = courseUnitsById.get(selection.courseUnitId);
        const moduleId = cuToTopModule.get(selection.courseUnitId) ?? null;
        const module = moduleId ? modulesById.get(moduleId) : undefined;
        const attainment = passedByUnit.get(selection.courseUnitId);

        return {
          courseUnitId: selection.courseUnitId,
          courseCode: extractCourseCode(selection.courseUnitId),
          courseName: courseUnit?.name ?? null,
          credits: courseUnit?.credits ?? null,
          moduleId,
          moduleName: module?.name ?? null,
          plannedPeriods: (selection.plannedPeriods ?? [])
            .map((periodLocator) => studyPeriodMap.get(periodLocator))
            .filter((period): period is StudyPeriodInfo => period != null),
          isPassed: attainment != null,
          grade: getGrade(attainment),
          isEnrolled: enrolledCourseUnits.has(selection.courseUnitId),
          parentModuleId: selection.parentModuleId ?? null,
        };
      });
    },
    {
      enabled:
        plansQuery.data != null &&
        attainmentsQuery.data != null &&
        enrolmentsQuery.data != null &&
        !studyPeriodMapLoading,
    },
  );

  return {
    timelineCourses: timelineCourses ?? [],
    isLoading:
      plansQuery.isLoading ||
      attainmentsQuery.isLoading ||
      enrolmentsQuery.isLoading ||
      studyPeriodMapLoading ||
      isLoading,
  };
};
