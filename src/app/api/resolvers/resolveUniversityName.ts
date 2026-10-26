import { koriApi } from '@/app/api/client';
import { pickLabel } from '@/app/api/resolvers/helpers/pickLabel';
import { getCurrentLocale } from '@/app/i18n';

const nameCache = new Map<string, string | null>();

export const resolveUniversityName = async (orgId: string): Promise<string | null> => {
  const cacheKey = `${orgId}:${getCurrentLocale()}`;
  if (nameCache.has(cacheKey)) return nameCache.get(cacheKey) ?? null;

  try {
    const response = await koriApi.api.getOrganisation(orgId);
    const name = pickLabel(response.data.name) ?? null;
    nameCache.set(cacheKey, name);
    return name;
  } catch {
    return null;
  }
};
