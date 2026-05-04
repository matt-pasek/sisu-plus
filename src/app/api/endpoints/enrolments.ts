import { ilmoApi } from '../client';
import type { Enrolment, EnrolRequest } from '../generated/IlmoApi';

export type { Enrolment, EnrolRequest };
export type EnrolmentsResponse = Enrolment[];

export async function fetchEnrolments(): Promise<EnrolmentsResponse> {
  const response = await ilmoApi.api.searchEnrolments1();
  return response.data;
}

export async function fetchEnrolmentsByRealisations(courseUnitRealisationIds: string[]): Promise<EnrolmentsResponse> {
  if (courseUnitRealisationIds.length === 0) return [];

  const response = await ilmoApi.api.searchEnrolments1({ courseUnitRealisationId: courseUnitRealisationIds });
  return response.data;
}

export async function createOwnEnrolment(enrolment: Enrolment): Promise<Enrolment> {
  const response = await ilmoApi.api.createOwnEnrolment(enrolment);
  return response.data;
}

export async function enrol(enrolmentId: string, request: EnrolRequest): Promise<Enrolment> {
  const response = await ilmoApi.api.enrol(enrolmentId, request);
  return response.data;
}

export async function cancelEnrolment(enrolmentId: string): Promise<Enrolment> {
  const response = await ilmoApi.api.cancelEnrolment(enrolmentId);
  return response.data;
}

export async function abortOwnEnrolment(enrolmentId: string): Promise<Enrolment> {
  const response = await ilmoApi.api.abortOwnEnrolment(enrolmentId);
  return response.data;
}

export async function updateOwnEnrolment(enrolmentId: string, request: Enrolment): Promise<Enrolment> {
  const response = await ilmoApi.api.updateOwnEnrolment(enrolmentId, request);
  return response.data;
}
