import { fetchEnrolments } from '@/app/api/endpoints/enrolments';
import { fetchPlans } from '@/app/api/endpoints/plans';
import { getStudyPeriodMap, type StudyPeriodInfo } from '@/app/api/dataPoints/getStudyPeriodMap';
import { resolveCourseRealisations } from '@/app/api/resolvers/resolveCourseRealisations';
import { resolveCourseUnit } from '@/app/api/resolvers/resolveCourseUnit';
import { useSisuQuery } from '@/app/hooks/useSisuQuery';
import type { Enrolment } from '@/app/api/generated/IlmoApi';
import type { RealisationResult } from '@/app/api/resolvers/resolveRealization';

export type RegistrationStatus = 'not-selected' | 'not-enrolled' | 'processing' | 'registered' | 'rejected';

export interface RegistrationImplementation {
  id: string;
  assessmentItemIds: string[];
  name: string | null;
  activityEnd: string | null;
  activityStart: string | null;
  cancellationEnd: string | null;
  enrolmentEnd: string | null;
  enrolmentStart: string | null;
  externalEnrolmentUrl: string | null;
  flowState: string | null;
  isEnrolmentOpen: boolean;
  isUpcoming: boolean;
  studyGroupSetCount: number;
  studyGroupSets: RegistrationStudyGroupSet[];
  typeLabel: string;
  usesExternalEnrolment: boolean;
}

export interface RegistrationStudyGroupSet {
  id: string;
  max: number | null;
  min: number;
  name: string | null;
  subGroups: RegistrationStudySubGroup[];
}

export interface RegistrationStudySubGroup {
  id: string;
  name: string | null;
}

export interface RegistrationCourse {
  courseCode: string | null;
  courseName: string | null;
  courseUnitId: string;
  credits: number | null;
  enrolment: Enrolment | null;
  enrolments: Enrolment[];
  implementations: RegistrationImplementation[];
  plannedPeriods: StudyPeriodInfo[];
  selectedImplementation: RegistrationImplementation | null;
  status: RegistrationStatus;
  studyRightId: string | null;
}

export interface RegistrationPeriod {
  id: string;
  courses: RegistrationCourse[];
  endDate: string;
  label: string;
  startDate: string;
}

function compareNullableDate(first: string | null, second: string | null): number {
  if (first == null && second == null) return 0;
  if (first == null) return 1;
  if (second == null) return -1;
  return first.localeCompare(second);
}

function getTypeLabel(typeUrn: string | null): string {
  if (!typeUrn) return 'Course implementation';

  const type = typeUrn.split(':').at(-1)?.replaceAll('-', ' ') ?? 'Course implementation';
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function isDateTimeInRange(start: string | null, end: string | null): boolean {
  const now = new Date().toISOString();
  return (start == null || start <= now) && (end == null || now < end);
}

function isFutureDateTime(value: string | null): boolean {
  return value != null && new Date().toISOString() < value;
}

function toRegistrationImplementation(realisation: RealisationResult): RegistrationImplementation | null {
  if (!realisation.id) return null;

  const effectiveEnrolmentEnd = realisation.lateEnrolmentEnd ?? realisation.enrolmentEnd;

  return {
    id: realisation.id,
    assessmentItemIds: realisation.assessmentItemIds,
    name: realisation.name,
    activityEnd: realisation.endDate,
    activityStart: realisation.startDate,
    cancellationEnd: realisation.cancellationEnd,
    enrolmentEnd: effectiveEnrolmentEnd,
    enrolmentStart: realisation.enrolmentStart,
    externalEnrolmentUrl: realisation.externalEnrolmentUrl,
    flowState: realisation.flowState,
    isEnrolmentOpen:
      realisation.continuousEnrolment || isDateTimeInRange(realisation.enrolmentStart, effectiveEnrolmentEnd),
    isUpcoming: isFutureDateTime(realisation.enrolmentStart),
    studyGroupSetCount: realisation.studyGroupSets.length,
    studyGroupSets: realisation.studyGroupSets,
    typeLabel: getTypeLabel(realisation.typeUrn),
    usesExternalEnrolment: realisation.usesExternalEnrolment,
  };
}

export function getRegistrationStatus(
  enrolment: Enrolment | null,
  implementation: RegistrationImplementation | null,
): RegistrationStatus {
  if (!implementation) return 'not-selected';
  if (!enrolment) return 'not-enrolled';

  switch (enrolment.state) {
    case 'CONFIRMED':
    case 'ENROLLED':
    case 'RESERVED':
      return 'registered';
    case 'PROCESSING':
      return 'processing';
    case 'REJECTED':
    case 'INVALID':
    case 'ABORTED_BY_STUDENT':
    case 'ABORTED_BY_TEACHER':
      return 'rejected';
    default:
      return 'not-enrolled';
  }
}

function formatAcademicYear(startYear: number): string {
  return `${startYear}-${startYear + 1}`;
}

function belongsToPeriod(course: RegistrationCourse, period: StudyPeriodInfo): boolean {
  return course.plannedPeriods.some((plannedPeriod) => plannedPeriod.locator === period.locator);
}

function getUniqueEnrolments(enrolments: Enrolment[]): Enrolment[] {
  const seen = new Set<string>();

  return enrolments.filter((enrolment) => {
    const key = enrolment.id ?? enrolment.courseUnitRealisationId;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export const getRegistrationCourses = (): {
  courses: RegistrationCourse[];
  isLoading: boolean;
  periods: RegistrationPeriod[];
  statusCourses: RegistrationCourse[];
} => {
  const plansQuery = useSisuQuery(['plans'], fetchPlans);
  const enrolmentsQuery = useSisuQuery(['enrolments'], fetchEnrolments);
  const { studyPeriodMap, isLoading: studyPeriodMapLoading } = getStudyPeriodMap();

  const { data: courses = [], isLoading } = useSisuQuery(
    ['registration-courses'],
    async () => {
      const plan = plansQuery.data?.find((candidate) => candidate.primary) ?? plansQuery.data?.[0];
      if (!plan) return [];

      const enrolmentsByCourseUnit = (enrolmentsQuery.data ?? []).reduce((map, enrolment) => {
        const current = map.get(enrolment.courseUnitId) ?? [];
        map.set(enrolment.courseUnitId, [...current, enrolment]);
        return map;
      }, new Map<string, Enrolment[]>());
      const enrolmentsByRealisation = new Map(
        (enrolmentsQuery.data ?? []).map((enrolment) => [enrolment.courseUnitRealisationId, enrolment]),
      );
      const courseUnits = await Promise.all(
        plan.courseUnitSelections.map(async (selection) => ({
          selection,
          courseUnit: await resolveCourseUnit(selection.courseUnitId),
        })),
      );
      const realisationsByCourseUnitId = new Map<string, RegistrationImplementation[]>();

      await Promise.all(
        courseUnits.map(async ({ selection, courseUnit }) => {
          const realisations = await resolveCourseRealisations(courseUnit.assessmentItemIds);
          realisationsByCourseUnitId.set(
            selection.courseUnitId,
            realisations
              .map(toRegistrationImplementation)
              .filter((implementation): implementation is RegistrationImplementation => implementation != null)
              .sort((first, second) => compareNullableDate(first.activityStart, second.activityStart)),
          );
        }),
      );

      return courseUnits.map(({ selection, courseUnit }): RegistrationCourse => {
        const plannedPeriods = (selection.plannedPeriods ?? [])
          .map((periodLocator) => studyPeriodMap.get(periodLocator))
          .filter((period): period is StudyPeriodInfo => period != null);
        const implementations = realisationsByCourseUnitId.get(selection.courseUnitId) ?? [];
        const courseUnitEnrolments = enrolmentsByCourseUnit.get(selection.courseUnitId) ?? [];
        const implementationEnrolments = implementations
          .map((implementation) => enrolmentsByRealisation.get(implementation.id) ?? null)
          .filter((candidate): candidate is Enrolment => candidate != null);
        const enrolments = getUniqueEnrolments([...implementationEnrolments, ...courseUnitEnrolments]);
        const enrolment = enrolments[0] ?? null;
        const selectedImplementation =
          implementations.find((implementation) =>
            enrolments.some((candidate) => candidate.courseUnitRealisationId === implementation.id),
          ) ??
          implementations.find((implementation) => implementation.isEnrolmentOpen) ??
          implementations[0] ??
          null;

        return {
          courseCode: courseUnit.code,
          courseName: courseUnit.name,
          courseUnitId: selection.courseUnitId,
          credits: courseUnit.credits,
          enrolment,
          enrolments,
          implementations,
          plannedPeriods,
          selectedImplementation,
          status: getRegistrationStatus(enrolment, selectedImplementation),
          studyRightId: null,
        };
      });
    },
    {
      enabled: plansQuery.data != null && enrolmentsQuery.data != null && !studyPeriodMapLoading,
    },
  );

  const periods = [...studyPeriodMap.values()]
    .filter((period) => period.locator != null)
    .map((period) => ({
      id: period.locator,
      courses: courses.filter((course) => belongsToPeriod(course, period)),
      endDate: period.endDate,
      label: `${period.name} - ${period.termName} ${formatAcademicYear(period.studyYear)}`,
      startDate: period.startDate,
    }))
    .filter((period) => period.courses.length > 0)
    .sort((first, second) => first.startDate.localeCompare(second.startDate));
  const statusCourses = courses.filter((course) => course.enrolments.length > 0);

  return {
    courses,
    isLoading: plansQuery.isLoading || enrolmentsQuery.isLoading || studyPeriodMapLoading || isLoading,
    periods,
    statusCourses,
  };
};
