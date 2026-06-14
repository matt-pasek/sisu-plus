import type { RegistrationCourse, RegistrationImplementation } from '@/app/api/dataPoints/getRegistrationCourses';
import { isExamImplementation } from '@/app/views/registration/util';
import { RegistrationTab } from '@/app/views/registration/types';

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

export const canWithdrawImplementation = (implementation: RegistrationImplementation | null): boolean =>
  implementation != null && !isImplementationFinished(implementation) && !canCancelImplementation(implementation);

export const isImplementationSelectable = (implementation: RegistrationImplementation | null): boolean => {
  if (!implementation || isImplementationFinished(implementation)) return false;
  return (
    implementation.isEnrolmentOpen ||
    implementation.isUpcoming ||
    (implementation.usesExternalEnrolment && implementation.externalEnrolmentUrl != null)
  );
};

export const isImplementationRegisterable = (implementation: RegistrationImplementation | null): boolean => {
  if (!implementation || isImplementationFinished(implementation)) return false;
  return (
    implementation.isEnrolmentOpen ||
    (implementation.usesExternalEnrolment && implementation.externalEnrolmentUrl != null)
  );
};
export const getImplementationsForTab = (
  course: RegistrationCourse,
  tab: RegistrationTab,
): RegistrationImplementation[] =>
  course.implementations.filter((impl) => isExamImplementation(impl) === (tab === 'exam'));

export const getSelectableImplementation = (
  course: RegistrationCourse,
  tab: RegistrationTab,
): RegistrationImplementation | null => getImplementationsForTab(course, tab).find(isImplementationSelectable) ?? null;
