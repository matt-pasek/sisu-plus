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

export const importTimetable = (text: string, courseCode: string | null): LinkedImport | null => {
  try {
    return toLinkedSeries(parseIcsCalendar(text).events ?? [], courseCode);
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
