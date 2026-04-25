import { koriApi } from '@/app/api/client';
import { pickLabel } from '@/app/api/resolvers/helpers/pickLabel';

export type RealisationResult = { startDate: string | null; endDate: string | null; name: string | null };

const realisationCache = new Map<string, RealisationResult>();

export const resolveRealisation = async (courseUnitRealisationId: string): Promise<RealisationResult> => {
  const cached = realisationCache.get(courseUnitRealisationId);
  if (cached) return cached;

  try {
    const response = await koriApi.api.getCourseUnitRealisation(courseUnitRealisationId);
    const realisation = response.data;
    const result: RealisationResult = {
      startDate: realisation.activityPeriod?.startDate ?? null,
      endDate: realisation.activityPeriod?.endDate ?? null,
      name: pickLabel(realisation.name),
    };
    realisationCache.set(courseUnitRealisationId, result);
    return result;
  } catch {
    const fallback: RealisationResult = { startDate: null, endDate: null, name: null };
    realisationCache.set(courseUnitRealisationId, fallback);
    return fallback;
  }
};
