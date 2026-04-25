import type { TimelineCourse } from '@/app/api/dataPoints/getTimelineCourses';
import type { StudyPeriodInfo, StudyPeriodMap } from '@/app/api/dataPoints/getStudyPeriodMap';

export interface PeriodCreditSummary {
  periodLocator: string;
  period: StudyPeriodInfo;
  plannedCredits: number;
  completedCredits: number;
  courses: TimelineCourse[];
}

export interface SemesterCreditSummary {
  studyYear: number;
  termName: string;
  plannedCredits: number;
  completedCredits: number;
  periods: PeriodCreditSummary[];
  courses: TimelineCourse[];
}

function getCourseCredits(course: TimelineCourse): number {
  return course.credits ?? 0;
}

export function getCreditsByPeriod(courses: TimelineCourse[], studyPeriodMap: StudyPeriodMap): PeriodCreditSummary[] {
  const summariesByLocator = new Map<string, PeriodCreditSummary>();

  for (const period of studyPeriodMap.values()) {
    summariesByLocator.set(period.locator, {
      periodLocator: period.locator,
      period,
      plannedCredits: 0,
      completedCredits: 0,
      courses: [],
    });
  }

  for (const course of courses) {
    for (const period of course.plannedPeriods) {
      const summary = summariesByLocator.get(period.locator);
      if (!summary) continue;

      const credits = getCourseCredits(course);
      summary.plannedCredits += credits;
      if (course.isPassed) summary.completedCredits += credits;
      summary.courses.push(course);
    }
  }

  return [...summariesByLocator.values()].sort((a, b) => a.period.startDate.localeCompare(b.period.startDate));
}

export function getCreditsBySemester(periods: PeriodCreditSummary[]): SemesterCreditSummary[] {
  const summariesBySemester = new Map<string, SemesterCreditSummary>();

  for (const periodSummary of periods) {
    const key = `${periodSummary.period.studyYear}:${periodSummary.period.termName}`;
    const existing = summariesBySemester.get(key);

    if (existing) {
      existing.plannedCredits += periodSummary.plannedCredits;
      existing.completedCredits += periodSummary.completedCredits;
      existing.periods.push(periodSummary);
      existing.courses.push(...periodSummary.courses);
      continue;
    }

    summariesBySemester.set(key, {
      studyYear: periodSummary.period.studyYear,
      termName: periodSummary.period.termName,
      plannedCredits: periodSummary.plannedCredits,
      completedCredits: periodSummary.completedCredits,
      periods: [periodSummary],
      courses: [...periodSummary.courses],
    });
  }

  return [...summariesBySemester.values()].sort((a, b) => {
    if (a.studyYear !== b.studyYear) return a.studyYear - b.studyYear;
    const firstPeriodA = a.periods[0]?.period.startDate ?? '';
    const firstPeriodB = b.periods[0]?.period.startDate ?? '';
    return firstPeriodA.localeCompare(firstPeriodB);
  });
}
