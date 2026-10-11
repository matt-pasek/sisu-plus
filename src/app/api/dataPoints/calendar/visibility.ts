import type { Enrolment } from '@/app/api/generated/IlmoApi';
import type { CalendarCourse, CalendarRowsResult, VisibilityChange } from './types';

export const withCalendarFlags = (enrolment: Enrolment, change: VisibilityChange): Enrolment | null => {
  const entries = enrolment.studySubGroups ?? [];
  const missing = change.groups.some((flag) => !entries.some((entry) => entry.studySubGroupId === flag.groupId));
  if (missing) return null;
  const withGroups =
    change.groups.length === 0
      ? enrolment
      : {
          ...enrolment,
          studySubGroups: entries.map((entry) => {
            const flag = change.groups.find((item) => item.groupId === entry.studySubGroupId);
            return flag ? { ...entry, isInCalendar: flag.visible } : entry;
          }),
        };
  return change.courseVisible === undefined ? withGroups : { ...withGroups, isInCalendar: change.courseVisible };
};

const withCourseFlags = (course: CalendarCourse, change: VisibilityChange): CalendarCourse => ({
  ...course,
  isInCalendar: change.courseVisible ?? course.isInCalendar,
  groupSets: course.groupSets.map((set) => ({
    ...set,
    groups: set.groups.map((group) => {
      const flag = change.groups.find((item) => item.groupId === group.id);
      return flag ? { ...group, isInCalendar: flag.visible } : group;
    }),
  })),
});

export const applyVisibilityToRows = (rows: CalendarRowsResult, change: VisibilityChange): CalendarRowsResult => {
  const courses = rows.courses.map((course) =>
    course.realisationId === change.courseKey ? withCourseFlags(course, change) : course,
  );
  const course = courses.find((item) => item.realisationId === change.courseKey);
  const visibleIds = new Set(
    course?.groupSets.flatMap((set) => set.groups.filter((group) => group.isInCalendar).map((group) => group.id)) ?? [],
  );
  const turnedOff = new Set(change.groups.filter((flag) => !flag.visible).map((flag) => flag.groupId));
  const sessions = rows.sessions.filter((session) => {
    if (session.courseKey !== change.courseKey) return true;
    if (course && !course.isInCalendar) return false;
    const lostOwner = session.groupIds.some((id) => turnedOff.has(id));
    return !lostOwner || session.groupIds.some((id) => visibleIds.has(id));
  });
  return { sessions, courses };
};
