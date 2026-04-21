import { ilmoApi } from '../client';
import type { Enrolment } from '../generated/IlmoApi';

export type { Enrolment };
export type EnrolmentsResponse = Enrolment[];

export async function fetchEnrolments(): Promise<EnrolmentsResponse> {
  const response = await ilmoApi.api.searchEnrolments1();
  return response.data;
}
