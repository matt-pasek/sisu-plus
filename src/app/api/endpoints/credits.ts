import { oriApi } from '@/app/api/client';

export async function fetchCredits(studyRightId: string): Promise<number> {
  const response = await oriApi.api.getCredits(studyRightId);
  return response.data;
}
