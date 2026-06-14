import { CourseUnitAttainmentRestricted } from '@/app/api/generated/OriApi';
import type { Attainment } from '@/app/api/endpoints/attainments';

export const isCourseUnitAttainment = (attainment: Attainment): attainment is CourseUnitAttainmentRestricted =>
  attainment.type === 'CourseUnitAttainment';
