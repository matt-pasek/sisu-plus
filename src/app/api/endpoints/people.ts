import { koriApi, oriApi } from '@/app/api/client';
import type { PublicPerson } from '@/app/api/generated/KoriApi';
import type { PrivatePersonBasicInfo } from '@/app/api/generated/OriApi';

export async function fetchPublicPersons(personIds: string[]): Promise<PublicPerson[]> {
  const uniqueIds = [...new Set(personIds)].filter(Boolean);
  if (uniqueIds.length === 0) return [];

  try {
    const response = await koriApi.api.getPersons({ id: uniqueIds });
    return response.data;
  } catch {
    const persons = await Promise.allSettled(
      uniqueIds.map((personId) => koriApi.api.getPerson(personId).then((response) => response.data)),
    );
    return persons
      .filter((result): result is PromiseFulfilledResult<PublicPerson> => result.status === 'fulfilled')
      .map((result) => result.value);
  }
}

export async function fetchPersonBasicInfos(personIds: string[]): Promise<PrivatePersonBasicInfo[]> {
  const uniqueIds = [...new Set(personIds)].filter(Boolean);
  if (uniqueIds.length === 0) return [];

  try {
    const response = await oriApi.api.getPersonBasicInfos({ id: uniqueIds });
    return response.data;
  } catch {
    return [];
  }
}
