import { Enrolment } from '@/app/api/generated/IlmoApi';
import { RegistrationCourse } from '@/app/api/dataPoints/getRegistrationCourses';

export type RegistrationAttempt = {
  course: RegistrationCourse;
  enrolment: Enrolment;
};
