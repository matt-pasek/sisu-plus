import type { Enrolment } from '@/app/api/generated/IlmoApi';
import type { RegistrationCourse } from '@/app/api/dataPoints/getRegistrationCourses';

export type RegistrationTab = 'course' | 'exam';
export type SelectionState = Record<string, string[]>;

export type RegistrationAttempt = {
  course: RegistrationCourse;
  enrolment: Enrolment;
};
