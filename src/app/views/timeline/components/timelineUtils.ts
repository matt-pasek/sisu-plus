import type { TimelineCourse } from '@/app/api/dataPoints/getTimelineCourses';
import type { PeriodCreditSummary, SemesterCreditSummary } from '@/app/api/dataPoints/getCreditsByPeriod';
import i18n, { getCurrentLocale, I18N_NAMESPACE } from '@/app/i18n';

export const TIMELINE_COLORS = ['#4A7EF0', '#10B981', '#F59E0B', '#A78BFA', '#EF4444', '#06B6D4'];

export function getModuleColor(moduleId: string | null, moduleIds: string[]): string {
  if (!moduleId) return '#7878A0';
  const index = moduleIds.indexOf(moduleId);
  return TIMELINE_COLORS[(index >= 0 ? index : 0) % TIMELINE_COLORS.length];
}

export function getCourseKey(course: TimelineCourse): string {
  return course.courseUnitId;
}

export function getStatusLabel(course: TimelineCourse): string {
  if (course.isPassed)
    return course.grade != null ? String(course.grade) : i18n.t('views.timeline.status.done', { ns: I18N_NAMESPACE });
  if (course.isEnrolled) return i18n.t('views.timeline.status.active', { ns: I18N_NAMESPACE });
  return i18n.t('views.timeline.status.planned', { ns: I18N_NAMESPACE });
}

export function getStatusClass(course: TimelineCourse): string {
  if (course.isPassed) return 'border-lighterGreen/20 bg-lighterGreen/10 text-lighterGreen';
  if (course.isEnrolled) return 'border-blue-400/20 bg-blue-400/10 text-blue-300';
  return 'border-warn/20 bg-warn/10 text-warn';
}

export function formatCredits(credits: number | null | undefined): string {
  const value = credits ?? 0;
  const rounded = Math.round(value * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)} ${i18n.t('util.credits.short', { ns: I18N_NAMESPACE })}`;
}

export function formatPeriodRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setDate(end.getDate() - 1);

  const startLabel = start.toLocaleString(getCurrentLocale(), { month: 'short', day: 'numeric' });
  const endLabel = end.toLocaleString(getCurrentLocale(), { month: 'short', day: 'numeric' });
  return `${startLabel} - ${endLabel}`;
}

export function getSemesterTitle(semester: SemesterCreditSummary): string {
  const firstPeriod = semester.periods[0]?.period;
  if (!firstPeriod) return semester.termName;

  const month = new Date(firstPeriod.startDate).getMonth() + 1;
  const season =
    month >= 8
      ? i18n.t('views.timeline.semester.autumn', { ns: I18N_NAMESPACE })
      : i18n.t('views.timeline.semester.spring', { ns: I18N_NAMESPACE });
  const year = month >= 8 ? firstPeriod.studyYear : firstPeriod.studyYear + 1;
  return `${season} ${year}`;
}

export function isCurrentPeriod(period: PeriodCreditSummary, now = new Date()): boolean {
  const start = new Date(period.period.startDate);
  const end = new Date(period.period.endDate);
  return now >= start && now < end;
}

export function isCurrentSemester(semester: SemesterCreditSummary, now = new Date()): boolean {
  return semester.periods.some((period) => isCurrentPeriod(period, now));
}

export function getVisibleSemesters(semesters: SemesterCreditSummary[]): SemesterCreditSummary[] {
  const semestersWithCourses = semesters.filter(
    (semester) => semester.courses.length > 0 || isCurrentSemester(semester),
  );
  if (semestersWithCourses.length === 0) return semesters.slice(0, 4);

  const firstIndex = semesters.indexOf(semestersWithCourses[0]);
  const lastIndex = semesters.indexOf(semestersWithCourses[semestersWithCourses.length - 1]);
  const from = Math.max(0, firstIndex - 1);
  const to = Math.min(semesters.length, lastIndex + 2);

  return semesters.slice(from, to);
}
