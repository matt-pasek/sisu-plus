import { koriApi } from '@/app/api/client';
import type { StudyEvent } from '@/app/api/generated/KoriApi';

const CHUNK_SIZE = 50;

export const fetchStudyEvents = async (ids: string[]): Promise<StudyEvent[]> => {
  const chunks = Array.from({ length: Math.ceil(ids.length / CHUNK_SIZE) }, (_, index) =>
    ids.slice(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE),
  );
  const results = await Promise.all(chunks.map((chunk) => koriApi.api.getStudyEvent({ id: chunk })));
  return results.flatMap((response) => response.data);
};
