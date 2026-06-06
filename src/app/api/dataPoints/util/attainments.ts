import type { CourseUnitAttainmentRestricted } from '@/app/api/generated/OriApi';

export const isPassingCourseUnitAttainment = (attainment: unknown): attainment is CourseUnitAttainmentRestricted => {
  const candidate = attainment as Partial<CourseUnitAttainmentRestricted>;
  return candidate.type === 'CourseUnitAttainment' && candidate.primary === true && candidate.state !== 'FAILED';
};
