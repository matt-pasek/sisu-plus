import type { IcsEvent } from 'ts-ics';
import { helsinkiDateKey, type DateRange } from '@/app/schedule';
import { decodeHtmlEntities, getCategoryLabel, getFirstIcsCategory } from '@/shared/icsCategory';
import type { CalendarCourse, CalendarDeadline, CourseUnitInfo, DeadlineCourse } from './types';

const SAFE_PROTOCOLS = new Set(['https:', 'http:']);

const escapeRegExp = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const deadlineCourses = (
  courses: CalendarCourse[],
  courseUnits: Record<string, CourseUnitInfo>,
): DeadlineCourse[] =>
  courses.flatMap((course) => {
    const code = course.courseUnitId ? courseUnits[course.courseUnitId]?.code : undefined;
    return code ? [{ code, name: course.name, colorIndex: course.colorIndex }] : [];
  });

export const matchDeadlineCourse = (category: string | null, courses: DeadlineCourse[]): DeadlineCourse | null => {
  if (!category) return null;
  const upper = category.toUpperCase();
  return (
    [...courses]
      .sort((a, b) => b.code.length - a.code.length)
      .find((course) =>
        new RegExp(`(^|[^A-Z0-9])${escapeRegExp(course.code.toUpperCase())}([^A-Z0-9]|$)`).test(upper),
      ) ?? null
  );
};

export const safeHttpUrl = (url: string | undefined): string | null => {
  if (!url) return null;
  try {
    return SAFE_PROTOCOLS.has(new URL(url).protocol) ? url : null;
  } catch {
    return null;
  }
};

export const toCalendarDeadlines = (
  events: IcsEvent[],
  courses: DeadlineCourse[],
  range: DateRange,
): CalendarDeadline[] =>
  events
    .flatMap((event): CalendarDeadline[] => {
      const dueAt = event.end?.date ?? event.start.date;
      if (!(dueAt instanceof Date) || Number.isNaN(dueAt.getTime())) return [];
      const dateKey = helsinkiDateKey(dueAt);
      if (dateKey < range.startKey || dateKey >= range.endKey) return [];
      const category = getFirstIcsCategory(event.categories);
      const course = matchDeadlineCourse(category, courses);
      return [
        {
          id: event.uid,
          title: decodeHtmlEntities(event.summary),
          dueAt,
          dateKey,
          courseLabel: course?.name ?? (category ? getCategoryLabel(category) : null),
          colorIndex: course?.colorIndex ?? null,
          url: safeHttpUrl(event.url),
        },
      ];
    })
    .sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime());
