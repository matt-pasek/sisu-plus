import type { PeriodCreditSummary, SemesterCreditSummary } from '@/app/api/dataPoints/getCreditsByPeriod';

export const isCurrentPeriod = (period: PeriodCreditSummary, now = new Date()) => {
  const start = new Date(period.period.startDate);
  const end = new Date(period.period.endDate);
  return now >= start && now < end;
};

export const isCurrentSemester = (semester: SemesterCreditSummary, now = new Date()) => {
  return semester.periods.some((period) => isCurrentPeriod(period, now));
};

export const getVisibleSemesters = (semesters: SemesterCreditSummary[]): SemesterCreditSummary[] => {
  const semestersWithCourses = semesters.filter(
    (semester) => semester.courses.length > 0 || isCurrentSemester(semester),
  );
  if (semestersWithCourses.length === 0) return semesters.slice(0, 4);

  const firstIndex = semesters.indexOf(semestersWithCourses[0]);
  const lastIndex = semesters.indexOf(semestersWithCourses[semestersWithCourses.length - 1]);
  const from = Math.max(0, firstIndex - 1);
  const to = Math.min(semesters.length, lastIndex + 2);

  return semesters.slice(from, to);
};
