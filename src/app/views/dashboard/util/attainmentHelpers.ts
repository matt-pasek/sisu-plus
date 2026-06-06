import type { Attainment } from '@/app/api/endpoints/attainments';
import type { CourseUnitAttainmentRestricted } from '@/app/api/generated/OriApi';
import { getCurrentLocale } from '@/app/i18n';

export const formatStudyRightEnd = (
  endDate: string | null,
  untilLabel: string,
): { year: string; until: string } | null => {
  if (!endDate) return null;
  const d = new Date(endDate);
  d.setDate(d.getDate() - 1);
  return {
    year: d.getFullYear().toString(),
    until: `${untilLabel} ${d.toLocaleString(getCurrentLocale(), { month: 'long' })}`,
  };
};

export const isCourseUnitAttainment = (attainment: Attainment): attainment is CourseUnitAttainmentRestricted =>
  attainment.type === 'CourseUnitAttainment';

export const getGrade = (attainment: CourseUnitAttainmentRestricted): number | string | null => {
  if (attainment.gradeScaleId.includes('hyl-hyv')) return attainment.gradeId != null ? 'pass' : null;
  return attainment.gradeId >= 1 && attainment.gradeId <= 5 ? attainment.gradeId : null;
};
