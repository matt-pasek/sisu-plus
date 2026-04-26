import { fetchAttainments } from '@/app/api/endpoints/attainments';
import { fetchEnrolments } from '@/app/api/endpoints/enrolments';
import { fetchPlans } from '@/app/api/endpoints/plans';
import { getStudyPeriodMap, type StudyPeriodInfo } from '@/app/api/dataPoints/getStudyPeriodMap';
import { resolveCourseRealisations } from '@/app/api/resolvers/resolveCourseRealisations';
import { resolveCourseUnit } from '@/app/api/resolvers/resolveCourseUnit';
import { resolveModule } from '@/app/api/resolvers/resolveModule';
import { buildCuToTopModuleMap } from '@/app/api/resolvers/helpers/buildCuToTopModuleMap';
import { useSisuQuery } from '@/app/hooks/useSisuQuery';
import type { CourseUnitAttainmentRestricted } from '@/app/api/generated/OriApi';
import type { RealisationResult } from '@/app/api/resolvers/resolveRealization';

export interface TimelineCourse {
  courseUnitId: string;
  courseUnitGroupId: string | null;
  courseCode: string | null;
  courseName: string | null;
  credits: number | null;
  moduleId: string | null;
  moduleName: string | null;
  plannedPeriods: StudyPeriodInfo[];
  completionPeriod: StudyPeriodInfo | null;
  attainmentDate: string | null;
  isPassed: boolean;
  grade: number | string | null;
  isEnrolled: boolean;
  parentModuleId: string | null;
  teachingPeriodLocators: string[];
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

function findPeriodForDate(periods: StudyPeriodInfo[], date: string | undefined): StudyPeriodInfo | null {
  if (!date) return null;
  return periods.find((period) => date >= period.startDate && date < period.endDate) ?? null;
}

function rangesOverlap(
  firstStart: string | null,
  firstEnd: string | null,
  secondStart: string,
  secondEnd: string,
): boolean {
  if (!firstStart || !firstEnd) return false;
  return firstStart < secondEnd && firstEnd > secondStart;
}

function getTeachingPeriodLocators(realisations: RealisationResult[], periods: StudyPeriodInfo[]): string[] {
  const offeredPeriodNames = new Set(
    periods
      .filter((period) =>
        realisations.some((realisation) =>
          rangesOverlap(realisation.startDate, realisation.endDate, period.startDate, period.endDate),
        ),
      )
      .map((period) => period.name),
  );

  if (offeredPeriodNames.size === 0) return [];

  return [...new Set(periods.filter((period) => offeredPeriodNames.has(period.name)).map((period) => period.locator))];
}

export const getTimelineCourses = (planId?: string): { timelineCourses: TimelineCourse[]; isLoading: boolean } => {
  const plansQuery = useSisuQuery(['plans'], fetchPlans);
  const attainmentsQuery = useSisuQuery(['attainments'], fetchAttainments);
  const enrolmentsQuery = useSisuQuery(['enrolments'], fetchEnrolments);
  const { studyPeriodMap, isLoading: studyPeriodMapLoading } = getStudyPeriodMap();

  const { data: timelineCourses, isLoading } = useSisuQuery(
    ['timeline-courses', planId],
    async () => {
      const plan =
        plansQuery.data!.find((candidate) => candidate.id === planId) ??
        plansQuery.data!.find((candidate) => candidate.primary) ??
        plansQuery.data![0];
      if (!plan) return [];

      const cuToTopModule = buildCuToTopModuleMap(plan);
      const courseUnitIds = plan.courseUnitSelections.map((selection) => selection.courseUnitId);
      const topModuleIds = [...new Set([...cuToTopModule.values()])];

      const courseUnitEntries = await Promise.all(
        courseUnitIds.map(async (courseUnitId) => [courseUnitId, await resolveCourseUnit(courseUnitId)] as const),
      );
      const realisationEntries = await Promise.all(
        courseUnitEntries.map(
          async ([courseUnitId, courseUnit]) =>
            [courseUnitId, await resolveCourseRealisations(courseUnit.assessmentItemIds)] as const,
        ),
      );
      const moduleEntries = await Promise.all(
        topModuleIds.map(async (moduleId) => [moduleId, await resolveModule(moduleId)] as const),
      );

      const courseUnitsById = new Map(courseUnitEntries);
      const realisationsByCourseUnitId = new Map(realisationEntries);
      const modulesById = new Map(moduleEntries);
      const studyPeriods = [...studyPeriodMap.values()];

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
        const plannedPeriods = (selection.plannedPeriods ?? [])
          .map((periodLocator) => studyPeriodMap.get(periodLocator))
          .filter((period): period is StudyPeriodInfo => period != null);
        const completionPeriod = findPeriodForDate(studyPeriods, attainment?.attainmentDate);
        const realisationPeriodLocators = getTeachingPeriodLocators(
          realisationsByCourseUnitId.get(selection.courseUnitId) ?? [],
          studyPeriods,
        );

        return {
          courseUnitId: selection.courseUnitId,
          courseUnitGroupId: courseUnit?.groupId ?? null,
          courseCode: courseUnit?.code ?? null,
          courseName: courseUnit?.name ?? null,
          credits: courseUnit?.credits ?? null,
          moduleId,
          moduleName: module?.name ?? null,
          plannedPeriods,
          completionPeriod,
          attainmentDate: attainment?.attainmentDate ?? null,
          isPassed: attainment != null,
          grade: getGrade(attainment),
          isEnrolled: enrolledCourseUnits.has(selection.courseUnitId),
          parentModuleId: selection.parentModuleId ?? null,
          teachingPeriodLocators:
            realisationPeriodLocators.length > 0
              ? realisationPeriodLocators
              : (courseUnit?.teachingPeriodLocators ?? []),
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
