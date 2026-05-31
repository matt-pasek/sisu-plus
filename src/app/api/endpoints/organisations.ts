import { koriApi } from '@/app/api/client';
import type { Organisation } from '@/app/api/generated/KoriApi';

export async function fetchOrganisations(organisationIds: string[]): Promise<Organisation[]> {
  const uniqueIds = [...new Set(organisationIds)].filter(Boolean);
  const organisations = await Promise.allSettled(
    uniqueIds.map((organisationId) => koriApi.api.getOrganisation(organisationId).then((response) => response.data)),
  );
  return organisations
    .filter((result): result is PromiseFulfilledResult<Organisation> => result.status === 'fulfilled')
    .map((result) => result.value);
}
