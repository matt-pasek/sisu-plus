import type { Enrolment } from '@/app/api/generated/IlmoApi';
import type {
  RegistrationCourse,
  RegistrationImplementation,
  RegistrationPeriod,
  RegistrationStatus,
} from '@/app/api/dataPoints/getRegistrationCourses';
import { getRegistrationStatus } from '@/app/api/dataPoints/getRegistrationCourses';
import { isExamImplementation } from './registrationFormatters';
import type { RegistrationAttempt, RegistrationTab, SelectionState } from './registrationTypes';

export const isImplementationFinished = (implementation: RegistrationImplementation | null): boolean => {
  if (!implementation?.activityEnd) return false;
  return implementation.activityEnd < new Date().toISOString();
};

export const canCancelImplementation = (implementation: RegistrationImplementation | null): boolean => {
  if (!implementation) return false;
  const now = new Date().toISOString();
  return (
    implementation.isEnrolmentOpen || (implementation.cancellationEnd != null && now < implementation.cancellationEnd)
  );
};

export const getImplementationsForTab = (
  course: RegistrationCourse,
  tab: RegistrationTab,
): RegistrationImplementation[] =>
  course.implementations.filter((impl) => isExamImplementation(impl) === (tab === 'exam'));

export const isImplementationSelectable = (implementation: RegistrationImplementation | null): boolean => {
  if (!implementation || isImplementationFinished(implementation)) return false;
  return (
    implementation.isEnrolmentOpen ||
    (implementation.usesExternalEnrolment && implementation.externalEnrolmentUrl != null)
  );
};

export const getSelectableImplementation = (
  course: RegistrationCourse,
  tab: RegistrationTab,
): RegistrationImplementation | null => getImplementationsForTab(course, tab).find(isImplementationSelectable) ?? null;

const getEnrolmentStatusPriority = (enrolment: Enrolment | null): number => {
  switch (enrolment?.state) {
    case 'CONFIRMED':
    case 'ENROLLED':
    case 'RESERVED':
      return 0;
    case 'PROCESSING':
      return 1;
    case 'REJECTED':
    case 'INVALID':
    case 'ABORTED_BY_STUDENT':
    case 'ABORTED_BY_TEACHER':
      return 2;
    case 'NOT_ENROLLED':
      return 3;
    default:
      return 4;
  }
};

export const getEnrolmentForImplementation = (
  course: RegistrationCourse,
  implementation: RegistrationImplementation,
): Enrolment | null =>
  course.enrolments.find((e) => e.courseUnitRealisationId === implementation.id) ??
  (course.enrolment?.courseUnitRealisationId === implementation.id ? course.enrolment : null);

export const getImplementationForEnrolment = (
  course: RegistrationCourse,
  enrolment: Enrolment | null,
): RegistrationImplementation | null => {
  if (!enrolment) return null;
  return course.implementations.find((impl) => impl.id === enrolment.courseUnitRealisationId) ?? null;
};

export const getEnrolmentsForTab = (course: RegistrationCourse, tab: RegistrationTab): Enrolment[] => {
  const implementationIds = new Set(getImplementationsForTab(course, tab).map((impl) => impl.id));
  return [...course.enrolments.filter((e) => implementationIds.has(e.courseUnitRealisationId))].sort(
    (a, b) => getEnrolmentStatusPriority(a) - getEnrolmentStatusPriority(b),
  );
};

export const getEnrolmentForTab = (course: RegistrationCourse, tab: RegistrationTab): Enrolment | null =>
  getEnrolmentsForTab(course, tab)[0] ?? null;

export const getPreferredImplementation = (
  course: RegistrationCourse,
  tab: RegistrationTab,
): RegistrationImplementation | null => {
  const implementations = getImplementationsForTab(course, tab);
  const enrolment = getEnrolmentForTab(course, tab);
  return (
    implementations.find((impl) => impl.id === enrolment?.courseUnitRealisationId) ??
    implementations.find((impl) => impl.isEnrolmentOpen) ??
    implementations[0] ??
    null
  );
};

export const getDraftImplementation = (
  course: RegistrationCourse,
  tab: RegistrationTab,
): RegistrationImplementation | null => {
  const enrolment = getEnrolmentForTab(course, tab);
  if (
    !enrolment ||
    getRegistrationStatus(enrolment, getImplementationForEnrolment(course, enrolment)) !== 'not-enrolled'
  ) {
    return null;
  }
  return getImplementationForEnrolment(course, enrolment);
};

export const getStatusForTab = (course: RegistrationCourse, tab: RegistrationTab): RegistrationStatus => {
  const enrolment = getEnrolmentForTab(course, tab);
  const implementation = enrolment
    ? getImplementationForEnrolment(course, enrolment)
    : getPreferredImplementation(course, tab);
  return getRegistrationStatus(enrolment, implementation);
};

export const isCourseRegisteredForTab = (course: RegistrationCourse, tab: RegistrationTab): boolean => {
  const status = getStatusForTab(course, tab);
  return status === 'registered' || status === 'processing' || status === 'rejected';
};

export const isCourseSelectionDraftForTab = (course: RegistrationCourse, tab: RegistrationTab): boolean =>
  getStatusForTab(course, tab) === 'not-enrolled';

export const courseMatchesPeriod = (course: RegistrationCourse, period: RegistrationPeriod | null): boolean => {
  if (!period) return false;
  return course.plannedPeriods.some((p) => p.locator === period.id);
};

const compareCoursesByImplementationDate = (
  first: RegistrationCourse,
  second: RegistrationCourse,
  tab: RegistrationTab,
): number => {
  const firstImpl = getEnrolmentForTab(first, tab)
    ? getPreferredImplementation(first, tab)
    : getSelectableImplementation(first, tab);
  const secondImpl = getEnrolmentForTab(second, tab)
    ? getPreferredImplementation(second, tab)
    : getSelectableImplementation(second, tab);
  const firstDate = firstImpl?.activityStart ?? firstImpl?.enrolmentEnd ?? '';
  const secondDate = secondImpl?.activityStart ?? secondImpl?.enrolmentEnd ?? '';
  if (firstDate && secondDate && firstDate !== secondDate) return firstDate.localeCompare(secondDate);
  if (firstDate && !secondDate) return -1;
  if (!firstDate && secondDate) return 1;
  return (first.courseName ?? first.courseCode ?? '').localeCompare(second.courseName ?? second.courseCode ?? '');
};

export const sortCoursesForTab = (courses: RegistrationCourse[], tab: RegistrationTab): RegistrationCourse[] =>
  [...courses].sort((first, second) => {
    const firstStatus = getStatusForTab(first, tab);
    const secondStatus = getStatusForTab(second, tab);
    if (firstStatus === 'rejected' && secondStatus !== 'rejected') return -1;
    if (firstStatus !== 'rejected' && secondStatus === 'rejected') return 1;
    return compareCoursesByImplementationDate(first, second, tab);
  });

export const sortAttemptsForTab = (attempts: RegistrationAttempt[], tab: RegistrationTab): RegistrationAttempt[] =>
  [...attempts].sort((first, second) => {
    const firstStatus = getRegistrationStatus(
      first.enrolment,
      getImplementationForEnrolment(first.course, first.enrolment),
    );
    const secondStatus = getRegistrationStatus(
      second.enrolment,
      getImplementationForEnrolment(second.course, second.enrolment),
    );
    if (firstStatus === 'rejected' && secondStatus !== 'rejected') return -1;
    if (firstStatus !== 'rejected' && secondStatus === 'rejected') return 1;

    const firstImpl = getImplementationForEnrolment(first.course, first.enrolment);
    const secondImpl = getImplementationForEnrolment(second.course, second.enrolment);
    const firstDate = firstImpl?.activityStart ?? firstImpl?.enrolmentEnd ?? '';
    const secondDate = secondImpl?.activityStart ?? secondImpl?.enrolmentEnd ?? '';
    if (firstDate && secondDate && firstDate !== secondDate) return firstDate.localeCompare(secondDate);
    if (firstDate && !secondDate) return -1;
    if (!firstDate && secondDate) return 1;
    return compareCoursesByImplementationDate(first.course, second.course, tab);
  });

export const getDefaultPeriodId = (periods: RegistrationPeriod[]): string | null => {
  const today = new Date().toISOString().slice(0, 10);
  return periods.find((p) => p.startDate <= today && today < p.endDate)?.id ?? periods[0]?.id ?? null;
};

export const getPeriodState = (period: RegistrationPeriod): 'current' | 'future' | 'past' => {
  const today = new Date().toISOString().slice(0, 10);
  if (today < period.startDate) return 'future';
  if (period.endDate <= today) return 'past';
  return 'current';
};

export const getDefaultSelections = (implementation: RegistrationImplementation | null): SelectionState => {
  if (!implementation) return {};
  return Object.fromEntries(
    implementation.studyGroupSets.map((set) => [
      set.id,
      set.subGroups.length <= set.min ? set.subGroups.map((sg) => sg.id) : [],
    ]),
  );
};

export const isSelectionValid = (
  implementation: RegistrationImplementation | null,
  selections: SelectionState,
): boolean => {
  if (!implementation) return false;
  return implementation.studyGroupSets.every((set) => {
    const count = selections[set.id]?.length ?? 0;
    return count >= set.min && (set.max == null || count <= set.max);
  });
};
