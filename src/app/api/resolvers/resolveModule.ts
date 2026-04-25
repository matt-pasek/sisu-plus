import { koriApi } from '@/app/api/client';
import { pickLabel } from '@/app/api/resolvers/helpers/pickLabel';
import type { CreditRange, LocalizedString } from '@/app/api/generated/KoriApi';

type ModuleResult = { name: string; targetCredits: number };

const moduleCache = new Map<string, ModuleResult>();

export const resolveModule = async (moduleId: string): Promise<ModuleResult> => {
  const cached = moduleCache.get(moduleId);
  if (cached) return cached;

  try {
    const response = await koriApi.api.getModule(moduleId);
    const mod = response.data as unknown as { name: LocalizedString; targetCredits?: CreditRange };
    const result: ModuleResult = {
      name: pickLabel(mod.name) ?? moduleId,
      targetCredits: mod.targetCredits?.min ?? 0,
    };
    moduleCache.set(moduleId, result);
    return result;
  } catch {
    const fallback: ModuleResult = { name: moduleId, targetCredits: 0 };
    moduleCache.set(moduleId, fallback);
    return fallback;
  }
};
