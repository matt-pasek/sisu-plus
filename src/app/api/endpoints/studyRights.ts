import { oriApi } from '@/app/api/client';
import { StudyRight } from '@/app/api/generated/OriApi';

export async function fetchStudyRights(): Promise<StudyRight[]> {
  const response = await oriApi.api.getMyStudyRight();
  return response.data;
}
