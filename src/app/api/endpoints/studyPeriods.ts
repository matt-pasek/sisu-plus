import { koriApi } from '../client';
import type { StudyYear } from '../generated/KoriApi';

export type { StudyYear };

export async function fetchStudyYears(org: string, firstYear: number, numYears: number): Promise<StudyYear[]> {
  const response = await koriApi.api.getStudyYears(org, firstYear, numYears);
  return response.data;
}
