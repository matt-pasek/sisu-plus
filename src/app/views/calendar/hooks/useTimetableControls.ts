import { useMemo } from 'react';
import type { CalendarData } from '@/app/api/dataPoints/calendar/types';
import type { TimetableControls } from '../types';

export const useTimetableControls = (
  data: CalendarData,
  onAdd: (courseKey: string) => void,
): { linkedLabels: Record<string, string>; timetables: TimetableControls } => {
  const linkedLabels = useMemo(
    () => Object.fromEntries(Object.entries(data.linked).map(([courseKey, state]) => [courseKey, state.label])),
    [data.linked],
  );
  const sisuCourseKeys = useMemo(
    () => new Set(data.sessions.filter((session) => session.source === 'sisu').map((session) => session.courseKey)),
    [data.sessions],
  );
  const timetables = useMemo<TimetableControls>(
    () => ({
      noTimesCourseKeys: data.noTimesCourseKeys,
      sisuCourseKeys,
      linked: data.linked,
      onAdd,
      onRefresh: data.refreshTimetable,
      onRemove: data.removeTimetable,
    }),
    [data.noTimesCourseKeys, sisuCourseKeys, data.linked, onAdd, data.refreshTimetable, data.removeTimetable],
  );
  return { linkedLabels, timetables };
};
