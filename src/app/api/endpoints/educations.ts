import { koriApi } from '../client';
import type { Education } from '../generated/KoriApi';

export type { Education };
export type EducationsResponse = Education[];

export async function fetchEducations(): Promise<EducationsResponse> {
  const response = await koriApi.api.findBy1();
  return response.data;
}

export async function fetchEducationById(id: string): Promise<Education | null> {
  const response = await koriApi.api.findBy1({ id: [id] });
  return response.data[0] ?? null;
}
