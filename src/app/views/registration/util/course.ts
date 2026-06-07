import {
  getRegistrationStatus,
  RegistrationCourse,
  RegistrationImplementation,
  type RegistrationPeriod,
  RegistrationStatus,
} from '@/app/api/dataPoints/getRegistrationCourses';
import { getImplementationsForTab, getSelectableImplementation } from '@/app/views/registration/util/implementation';
import { getEnrolmentForTab, getImplementationForEnrolment } from '@/app/views/registration/util';
import { RegistrationAttempt, RegistrationTab } from '@/app/views/registration/types/';

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
  getDraftImplementation(course, tab) != null;

export const courseMatchesPeriod = (course: RegistrationCourse, period: RegistrationPeriod | null): boolean => {
  if (!period) return false;
  return course.plannedPeriods.some((p) => p.locator === period.id);
};

const compareDates = (a: string, b: string) => {
  if (a && b && a !== b) return a.localeCompare(b);
  if (a && !b) return -1;
  if (!b && a) return 1;
  return 0;
};

const compareRejectedFirst = (a: RegistrationStatus, b: RegistrationStatus) => {
  if (a === 'rejected' && b !== 'rejected') return -1;
  if (a !== 'rejected' && b === 'rejected') return 1;
  return 0;
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

  return (
    compareDates(firstDate, secondDate) ||
    (first.courseName ?? first.courseCode ?? '').localeCompare(second.courseName ?? second.courseCode ?? '')
  );
};

export const sortCoursesForTab = (courses: RegistrationCourse[], tab: RegistrationTab): RegistrationCourse[] =>
  [...courses].sort((first, second) => {
    const firstStatus = getStatusForTab(first, tab);
    const secondStatus = getStatusForTab(second, tab);
    return compareRejectedFirst(firstStatus, secondStatus) || compareCoursesByImplementationDate(first, second, tab);
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
    const firstImpl = getImplementationForEnrolment(first.course, first.enrolment);
    const secondImpl = getImplementationForEnrolment(second.course, second.enrolment);
    const firstDate = firstImpl?.activityStart ?? firstImpl?.enrolmentEnd ?? '';
    const secondDate = secondImpl?.activityStart ?? secondImpl?.enrolmentEnd ?? '';

    return (
      compareRejectedFirst(firstStatus, secondStatus) ||
      compareDates(firstDate, secondDate) ||
      compareCoursesByImplementationDate(first.course, second.course, tab)
    );
  });

const getTodayDateString = (): string => new Date().toISOString().slice(0, 10);

export const getDefaultPeriodId = (periods: RegistrationPeriod[]): string | null => {
  const today = getTodayDateString();
  return periods.find((p) => p.startDate <= today && today < p.endDate)?.id ?? periods[0]?.id ?? null;
};

export const getPeriodState = (period: RegistrationPeriod): 'current' | 'future' | 'past' => {
  const today = getTodayDateString();
  if (today < period.startDate) return 'future';
  if (period.endDate <= today) return 'past';
  return 'current';
};
