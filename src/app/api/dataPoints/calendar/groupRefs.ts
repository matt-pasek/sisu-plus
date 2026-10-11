import type { GroupRef } from '@/app/schedule';
import type { CalendarCourse } from './types';

export const toGroupRefs = (courses: CalendarCourse[]): GroupRef[] =>
  courses.flatMap((course) =>
    course.groupSets.flatMap((set) =>
      set.groups.map((group) => ({
        id: group.id,
        courseKey: course.realisationId,
        setId: set.id,
        visible: course.isInCalendar && group.isInCalendar,
      })),
    ),
  );

export const groupIndex = (refs: GroupRef[]): Map<string, GroupRef> => new Map(refs.map((ref) => [ref.id, ref]));
