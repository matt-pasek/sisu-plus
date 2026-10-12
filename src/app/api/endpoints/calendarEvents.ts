import { ilmoApi } from '@/app/api/client';
import type { CalendarEvent } from '@/app/api/generated/IlmoApi';

export const fetchCalendarEvents = async (startDate: string, endDate: string): Promise<CalendarEvent[]> => {
  const response = await ilmoApi.api.getCalendarEvents({ startDate, endDate });
  return response.data;
};

export const createCalendarEvent = async (event: CalendarEvent): Promise<CalendarEvent> => {
  const response = await ilmoApi.api.saveCalendarEvent(event);
  return response.data;
};

export const updateCalendarEvent = async (id: string, event: CalendarEvent): Promise<CalendarEvent> => {
  const response = await ilmoApi.api.updateCalendarEvent(id, event);
  return response.data;
};

export const removeCalendarEvent = async (id: string): Promise<void> => {
  await ilmoApi.api.removeCalendarEvent(id);
};
