import { useMemo } from 'react';
import { getCalendarData } from '@/app/api/dataPoints/calendar/getCalendarData';
import type { CalendarData } from '@/app/api/dataPoints/calendar/types';
import { todayKey } from '@/app/schedule';
import { useClassReminderSync } from '@/app/views/calendar/hooks/useClassReminderSync';
import { useNow } from '@/app/views/calendar/hooks/useNow';
import type { NextClassModel } from '../types';
import { pickNextClass } from '../util/nextClass';

const NO_COURSE_KEYS: string[] = [];
const ignorePlanWriteError = (): void => undefined;

export const useNextClass = (): { data: CalendarData; model: NextClassModel | null; now: Date } => {
  const now = useNow();
  const data = getCalendarData(todayKey(now), {
    candidateCourseKeys: NO_COURSE_KEYS,
    onPlanWriteError: ignorePlanWriteError,
    span: 'term',
  });
  useClassReminderSync(data, now);
  const model = useMemo(() => pickNextClass(data.attended, now), [data.attended, now]);
  return { data, model, now };
};
