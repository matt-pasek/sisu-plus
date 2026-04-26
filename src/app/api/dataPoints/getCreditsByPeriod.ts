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

function addCourseOnce(summary: PeriodCreditSummary, course: TimelineCourse): void {
  if (!summary.courses.some((existing) => existing.courseUnitId === course.courseUnitId)) {
    summary.courses.push(course);
  }
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
    const plannedSummaries = course.plannedPeriods
      .map((period) => summariesByLocator.get(period.locator))
      .filter((summary): summary is PeriodCreditSummary => summary != null);
    const credits = getCourseCredits(course);

    if (plannedSummaries.length > 0) {
      const creditsPerPeriod = credits / plannedSummaries.length;
      for (const summary of plannedSummaries) {
        if (course.isPassed) {
          summary.completedCredits += creditsPerPeriod;
        } else {
          summary.plannedCredits += creditsPerPeriod;
        }
        addCourseOnce(summary, course);
      }
      continue;
    }

    if (course.isPassed && course.completionPeriod) {
      const completionSummary = course.completionPeriod
        ? summariesByLocator.get(course.completionPeriod.locator)
        : undefined;

      if (completionSummary) {
        completionSummary.completedCredits += credits;
        addCourseOnce(completionSummary, course);
      }
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
      existing.periods.push(periodSummary);
      existing.courses.push(...periodSummary.courses);
      continue;
    }

    summariesBySemester.set(key, {
      studyYear: periodSummary.period.studyYear,
      termName: periodSummary.period.termName,
      plannedCredits: 0,
      completedCredits: 0,
      periods: [periodSummary],
      courses: [...periodSummary.courses],
    });
  }

  const summaries = [...summariesBySemester.values()].map((semester) => {
    const coursesById = new Map(semester.courses.map((course) => [course.courseUnitId, course]));

    return {
      ...semester,
      plannedCredits: semester.periods.reduce((sum, period) => sum + period.plannedCredits, 0),
      completedCredits: semester.periods.reduce((sum, period) => sum + period.completedCredits, 0),
      courses: [...coursesById.values()],
    };
  });

  return summaries.sort((a, b) => {
    if (a.studyYear !== b.studyYear) return a.studyYear - b.studyYear;
    const firstPeriodA = a.periods[0]?.period.startDate ?? '';
    const firstPeriodB = b.periods[0]?.period.startDate ?? '';
    return firstPeriodA.localeCompare(firstPeriodB);
  });
}
