import { ilmoApi } from '@/app/api/client';
import type { EnrolmentWithStudyEvents } from '@/app/api/generated/IlmoApi';

interface StudyEventsInCalendarQuery {
  personId: string;
  startDate: string;
  endDate: string;
}

export const fetchStudyEventsInCalendar = async (
  query: StudyEventsInCalendarQuery,
): Promise<EnrolmentWithStudyEvents[]> => {
  const response = await ilmoApi.api.getEnrolmentsWithStudyEvents({ ...query, studySubGroupFilter: 'IN_CALENDAR' });
  return response.data;
};
