import { parseIcsCalendar } from '@ts-ics/schema-zod';
import {
  classifySessionKind,
  expandSeries,
  toLinkedSeries,
  type DateRange,
  type LinkedImport,
  type Session,
} from '@/app/schedule';
import type { CalendarCourse } from './types';

const FLOATING_TIME =
  /^(DTSTART|DTEND|EXDATE|RECURRENCE-ID)((?:;(?!TZID=)[^:;\r\n]+)*):(\d{8}T\d{6}(?:,\d{8}T\d{6})*)(\r?)$/gm;

// ts-ics reads a time without Z or TZID as UTC; for a Finnish timetable it is Finnish wall-clock time.
const anchorFloatingTimes = (text: string): string =>
  text.replace(
    FLOATING_TIME,
    (_line, name, params, value, cr) => `${name}${params};TZID=Europe/Helsinki:${value}${cr}`,
  );

export const importTimetable = (text: string, courseCode: string | null): LinkedImport | null => {
  try {
    return toLinkedSeries(parseIcsCalendar(anchorFloatingTimes(text)).events ?? [], courseCode);
  } catch {
    return null;
  }
};

export const mapLinkedSessions = (course: CalendarCourse, imported: LinkedImport, range: DateRange): Session[] =>
  imported.items.flatMap(({ series, summary, location }) => {
    const kind = classifySessionKind([summary], course.isExam);
    return expandSeries(series, range).map(
      (occurrence): Session => ({
        ...occurrence,
        id: `${occurrence.seriesId}@${occurrence.dateKey}#${occurrence.index}`,
        courseKey: course.realisationId,
        courseName: course.name,
        courseUnitId: course.courseUnitId,
        groupId: `linked:${course.realisationId}`,
        groupName: null,
        groupIds: [],
        kind,
        colorIndex: course.colorIndex,
        source: 'linked',
        locationText: location,
      }),
    );
  });

export const shownLinkedSessions = (course: CalendarCourse, imported: LinkedImport, range: DateRange): Session[] =>
  course.isInCalendar ? mapLinkedSessions(course, imported, range) : [];
