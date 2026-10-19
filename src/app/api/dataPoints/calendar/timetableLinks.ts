import type { Session } from '@/app/schedule';
import type { CalendarCourse, TimetableLink } from './types';

export const LINKS_KEY = 'calendarTimetables';
export const CACHE_PREFIX = 'linkedTimetable:';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const toLink = (value: unknown): TimetableLink | null =>
  isRecord(value) && typeof value.url === 'string'
    ? { url: value.url, codeFilter: typeof value.codeFilter === 'string' ? value.codeFilter : null }
    : null;

export const parseLinks = (value: unknown): Record<string, TimetableLink> =>
  isRecord(value)
    ? Object.fromEntries(
        Object.entries(value).flatMap(([courseKey, raw]) => {
          const link = toLink(raw);
          return link ? [[courseKey, link]] : [];
        }),
      )
    : {};

export const withLink = (
  links: Record<string, TimetableLink>,
  courseKey: string,
  link: TimetableLink,
): Record<string, TimetableLink> => ({ ...links, [courseKey]: link });

export const withoutLink = (links: Record<string, TimetableLink>, courseKey: string): Record<string, TimetableLink> =>
  Object.fromEntries(Object.entries(links).filter(([key]) => key !== courseKey));

export const parseCachedTimetable = (value: unknown): { url: string; text: string; fetchedAt: number } | null =>
  isRecord(value) &&
  typeof value.url === 'string' &&
  typeof value.text === 'string' &&
  typeof value.fetchedAt === 'number'
    ? { url: value.url, text: value.text, fetchedAt: value.fetchedAt }
    : null;

export const coursesWithoutTimes = (courses: CalendarCourse[], sessions: Session[]): Set<string> => {
  const withSessions = new Set(
    sessions.filter((session) => session.source === 'sisu').map((session) => session.courseKey),
  );
  return new Set(
    courses
      .filter(
        (course) =>
          !withSessions.has(course.realisationId) &&
          course.groupSets.every((set) => set.groups.every((group) => group.eventIds.length === 0)),
      )
      .map((course) => course.realisationId),
  );
};
