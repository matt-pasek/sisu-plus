import { koriApi } from '@/app/api/client';
import type { RealisationResult } from '@/app/api/resolvers/resolveRealization';
import { mapRealisationToResult } from '@/app/api/resolvers/resolveRealization';

const courseRealisationsCache = new Map<string, RealisationResult[]>();

function getCacheKey(assessmentItemIds: string[]): string {
  return [...assessmentItemIds].sort().join(':');
}

export async function resolveCourseRealisations(assessmentItemIds: string[]): Promise<RealisationResult[]> {
  const uniqueAssessmentItemIds = [...new Set(assessmentItemIds)].filter(Boolean);
  if (uniqueAssessmentItemIds.length === 0) return [];

  const cacheKey = getCacheKey(uniqueAssessmentItemIds);
  const cached = courseRealisationsCache.get(cacheKey);
  if (cached) return cached;

  try {
    const responses = await Promise.all(
      uniqueAssessmentItemIds.map((assessmentItemId) => koriApi.api.getCourseUnitRealisations({ assessmentItemId })),
    );
    const realisations = responses.flatMap((response) => response.data.map((r) => mapRealisationToResult(r)));

    courseRealisationsCache.set(cacheKey, realisations);
    return realisations;
  } catch {
    courseRealisationsCache.set(cacheKey, []);
    return [];
  }
}
