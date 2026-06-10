import type { RegistrationCourse, RegistrationImplementation } from '@/app/api/dataPoints/getRegistrationCourses';
import { getCurrentLocale } from '@/app/i18n';
import {
  getImplementationsForTab,
  getSelectableImplementation,
  getStatusForTab,
  isCourseRegisteredForTab,
} from '@/app/views/registration/util';

const MS_PER_DAY = 86_400_000;
const REGISTRATION_LOOKAHEAD_DAYS = 370;

export type RegistrationWidgetTone = 'danger' | 'warn' | 'info';

export interface DashboardExamItem {
  course: RegistrationCourse;
  daysUntil: number;
  implementation: RegistrationImplementation;
  startsAt: string;
}

export interface DashboardRegistrationItem {
  course: RegistrationCourse;
  daysUntil: number | null;
  implementation: RegistrationImplementation;
  progress: number;
  status: 'open' | 'upcoming';
  targetDate: string | null;
  tone: RegistrationWidgetTone;
}

const getTime = (value: string | null): number | null => {
  if (!value) return null;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
};

export const getDaysUntilDate = (value: string | null, now = Date.now()): number | null => {
  const time = getTime(value);
  return time == null ? null : Math.max(0, Math.ceil((time - now) / MS_PER_DAY));
};

export const formatWidgetDate = (value: string | null): string => {
  const time = getTime(value);
  if (time == null) return '-';
  return new Intl.DateTimeFormat(getCurrentLocale(), { day: 'numeric', month: 'short' }).format(new Date(time));
};

export const getCourseDisplayName = (course: RegistrationCourse): string =>
  course.courseName ?? course.courseCode ?? course.courseUnitId;

const getRegistrationProgress = (implementation: RegistrationImplementation): number => {
  const start = getTime(implementation.enrolmentStart);
  const end = getTime(implementation.enrolmentEnd);
  const now = Date.now();
  if (start == null || end == null || end <= start) return implementation.isEnrolmentOpen ? 0.65 : 0;
  return Math.min(Math.max((now - start) / (end - start), 0), 1);
};

const getRegistrationTone = (daysUntil: number | null): RegistrationWidgetTone => {
  if (daysUntil != null && daysUntil <= 2) return 'danger';
  if (daysUntil != null && daysUntil <= 5) return 'warn';
  return 'info';
};

const isCoursePlannedSoon = (course: RegistrationCourse): boolean => {
  const now = Date.now();
  const lookaheadEnd = now + REGISTRATION_LOOKAHEAD_DAYS * MS_PER_DAY;

  return course.plannedPeriods.some((period) => {
    const start = getTime(period.startDate);
    const end = getTime(period.endDate);
    if (start == null || end == null) return false;
    return end >= now && start <= lookaheadEnd;
  });
};

const getUpcomingRegistrationImplementation = (course: RegistrationCourse): RegistrationImplementation | null => {
  const selectable = getSelectableImplementation(course, 'course');
  if (selectable) return selectable;

  return (
    getImplementationsForTab(course, 'course')
      .filter((implementation) => implementation.isUpcoming && implementation.enrolmentStart != null)
      .sort((first, second) => (first.enrolmentStart ?? '').localeCompare(second.enrolmentStart ?? ''))[0] ?? null
  );
};

export const getUpcomingRegistrationItems = (courses: RegistrationCourse[]): DashboardRegistrationItem[] =>
  courses
    .filter(
      (course) =>
        isCoursePlannedSoon(course) &&
        !isCourseRegisteredForTab(course, 'course') &&
        getStatusForTab(course, 'course') !== 'processing',
    )
    .map((course): DashboardRegistrationItem | null => {
      const implementation = getUpcomingRegistrationImplementation(course);
      if (!implementation) return null;
      const status = implementation.isEnrolmentOpen || implementation.usesExternalEnrolment ? 'open' : 'upcoming';
      const targetDate = status === 'open' ? implementation.enrolmentEnd : implementation.enrolmentStart;
      const daysUntil = getDaysUntilDate(targetDate);
      return {
        course,
        daysUntil,
        implementation,
        progress: status === 'open' ? getRegistrationProgress(implementation) : 0,
        status,
        targetDate,
        tone: getRegistrationTone(daysUntil),
      };
    })
    .filter((item): item is DashboardRegistrationItem => item != null)
    .sort((first, second) => {
      if (first.status !== second.status) return first.status === 'open' ? -1 : 1;
      return (first.targetDate ?? '').localeCompare(second.targetDate ?? '');
    });

export const getOpenRegistrationCount = (courses: RegistrationCourse[]): number =>
  getUpcomingRegistrationItems(courses).filter((item) => item.status === 'open').length;

export const getUpcomingExamItems = (courses: RegistrationCourse[]): DashboardExamItem[] =>
  courses
    .flatMap((course) =>
      getImplementationsForTab(course, 'exam')
        .filter((implementation) =>
          course.enrolments.some((enrolment) => enrolment.courseUnitRealisationId === implementation.id),
        )
        .map((implementation): DashboardExamItem | null => {
          if (!implementation.activityStart) return null;
          if (implementation.activityStart < new Date().toISOString()) return null;
          const daysUntil = getDaysUntilDate(implementation.activityStart);
          if (daysUntil == null) return null;
          return {
            course,
            daysUntil,
            implementation,
            startsAt: implementation.activityStart,
          };
        }),
    )
    .filter((item): item is DashboardExamItem => item != null)
    .sort((first, second) => first.startsAt.localeCompare(second.startsAt));
