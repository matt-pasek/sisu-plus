import React from 'react';
import { getCalendarData } from '@/app/api/dataPoints/calendar/getCalendarData';
import { todayKey } from '@/app/schedule';
import { useClassReminderSync } from '@/app/views/calendar/hooks/useClassReminderSync';
import { useNow } from '@/app/views/calendar/hooks/useNow';

const NO_COURSE_KEYS: string[] = [];
const ignorePlanWriteError = (): void => undefined;
const MINUTE_MS = 60_000;

export const ClassReminderSync: React.FC = () => {
  const now = useNow(MINUTE_MS);
  const data = getCalendarData(todayKey(now), {
    candidateCourseKeys: NO_COURSE_KEYS,
    onPlanWriteError: ignorePlanWriteError,
    span: 'term',
  });
  useClassReminderSync(data, now);
  return null;
};
