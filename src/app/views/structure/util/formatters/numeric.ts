import { GradeAverageLike } from '@/app/views/structure/types';

export function formatGradeAverage(gradeAverage: GradeAverageLike | undefined): string {
  return gradeAverage?.value != null
    ? new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(gradeAverage.value)
    : '–';
}

export const formatYearRange = (startDate: string | undefined, endDate: string | undefined) => {
  const startYear = startDate?.split('-')[0];
  const endYear = endDate?.split('-')[0];
  if (!startYear) return null;
  if (!endYear || endYear === startYear) return startYear;
  return `${startYear}-${endYear}`;
};
