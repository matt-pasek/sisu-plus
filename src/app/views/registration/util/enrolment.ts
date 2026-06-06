import type { RegistrationCourse, RegistrationImplementation } from '@/app/api/dataPoints/getRegistrationCourses';
import type { Enrolment } from '@/app/api/generated/IlmoApi';
import { getImplementationsForTab } from '@/app/views/registration/util';
import type { RegistrationTab } from '@/app/views/registration/types/RegistrationTab.type';

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
