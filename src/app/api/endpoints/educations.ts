import { koriApi } from '../client';
import type { Education } from '../generated/KoriApi';

export type { Education };
export type EducationsResponse = Education[];

export async function fetchEducations(): Promise<EducationsResponse> {
  const response = await koriApi.api.findBy1();
  return response.data;
}
