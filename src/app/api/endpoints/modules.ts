import { koriApi } from '@/app/api/client';
import type { DegreeProgramme, GroupingModule, StudyModule } from '@/app/api/generated/KoriApi';

export type Module = DegreeProgramme | GroupingModule | StudyModule;

export async function fetchModulesByGroupIds(groupIds: string[], universityId?: string): Promise<Module[]> {
  const uniqueGroupIds = [...new Set(groupIds)].filter(Boolean);
  if (uniqueGroupIds.length === 0) return [];

  if (universityId) {
    try {
      const response = await koriApi.api.findByGroupIdAndCurriculumPeriodIdIntegrator({
        groupId: uniqueGroupIds,
        universityId,
        documentStates: ['ACTIVE'],
      });
      return response.data;
    } catch {
      // fall through to per-group look-up blw
    }
  }

  const modules = await Promise.allSettled(
    uniqueGroupIds.map((groupId) => koriApi.api.findByGroupIdIntegrator({ groupId }).then((response) => response.data)),
  );

  return modules
    .filter((result): result is PromiseFulfilledResult<Module[]> => result.status === 'fulfilled')
    .flatMap((result) => result.value);
}
