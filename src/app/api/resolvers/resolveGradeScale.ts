import { koriApi } from '@/app/api/client';
import { pickLabel } from '@/app/api/resolvers/helpers/pickLabel';
import { getCurrentLocale } from '@/app/i18n';

const cache = new Map<string, string>();
const inFlight = new Map<string, Promise<string>>();

function formatGradeScaleFallback(id: string): string {
  const last = id.split(':').at(-1) ?? id;
  return last
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export async function resolveGradeScaleName(gradeScaleId: string): Promise<string> {
  const cacheKey = `${gradeScaleId}:${getCurrentLocale()}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const existing = inFlight.get(cacheKey);
  if (existing) return existing;

  const promise = (async () => {
    try {
      const response = await koriApi.api.getGradeScale(gradeScaleId);
      const name = pickLabel(response.data.name as Record<string, string>) ?? formatGradeScaleFallback(gradeScaleId);
      cache.set(cacheKey, name);
      return name;
    } catch {
      const fallback = formatGradeScaleFallback(gradeScaleId);
      cache.set(cacheKey, fallback);
      return fallback;
    } finally {
      inFlight.delete(cacheKey);
    }
  })();

  inFlight.set(cacheKey, promise);
  return promise;
}
