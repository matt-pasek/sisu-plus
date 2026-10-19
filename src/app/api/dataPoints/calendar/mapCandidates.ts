import { classifySessionKind, expandSeries, type DateRange, type Session } from '@/app/schedule';
import { toSeries } from './studyEventSeries';
import type { CalendarCourse, LabelPicker, StudyEventLike } from './types';

export const mapCandidateSessions = (
  course: CalendarCourse,
  events: StudyEventLike[],
  range: DateRange,
  label: LabelPicker,
): Session[] => {
  const byId = new Map(events.flatMap((event) => (event.id ? [[event.id, event] as const] : [])));
  const ownersOf = (eventId: string): string[] =>
    course.groupSets.flatMap((set) =>
      set.groups.filter((group) => group.eventIds.includes(eventId)).map((group) => group.id),
    );
  return course.groupSets.flatMap((set) =>
    set.groups
      .filter((group) => !group.cancelled)
      .flatMap((group) =>
        group.eventIds.flatMap((eventId) => {
          const event = byId.get(eventId);
          if (!event) return [];
          const kind = classifySessionKind([group.name, label(event.name), set.name], course.isExam);
          return expandSeries(toSeries(event, eventId, label), range).map(
            (occurrence): Session => ({
              ...occurrence,
              id: `${occurrence.seriesId}@${occurrence.dateKey}#${occurrence.index}`,
              courseKey: course.realisationId,
              courseName: course.name,
              courseUnitId: course.courseUnitId,
              groupId: group.id,
              groupName: group.name,
              groupIds: ownersOf(eventId),
              kind,
              colorIndex: course.colorIndex,
              source: 'sisu',
              locationText: null,
            }),
          );
        }),
      ),
  );
};
