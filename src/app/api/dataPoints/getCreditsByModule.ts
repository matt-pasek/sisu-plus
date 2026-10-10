import { useSisuQuery } from '@/app/hooks/useSisuQuery';
import { fetchPlans } from '@/app/api/endpoints/plans';
import { fetchAttainments } from '@/app/api/endpoints/attainments';
import { resolveModule } from '@/app/api/resolvers/resolveModule';
import { resolveCourseUnit } from '@/app/api/resolvers/resolveCourseUnit';
import { buildCuToTopModuleMap } from '@/app/api/resolvers/helpers/buildCuToTopModuleMap';
import type { CourseUnitAttainmentRestricted } from '@/app/api/generated/OriApi';

export type ModuleProgress = {
  moduleId: string;
  name: string;
  done: number;
  target: number;
};

export type ModuleProgressResult = {
  modules: ModuleProgress[];
  totalTarget: number;
};

export const getCreditsByModule = () => {
  const plansQuery = useSisuQuery(['plans'], fetchPlans);
  const attainmentsQuery = useSisuQuery(['attainments'], fetchAttainments);

  const { data: result, isLoading: modulesLoading } = useSisuQuery(
    ['module-progress'],
    async (): Promise<ModuleProgressResult> => {
      const plan = plansQuery.data![0];
      if (!plan) return { modules: [], totalTarget: 0 };

      let topLevelModuleIds = plan.moduleSelections
        .filter((ms) => ms.parentModuleId === plan.rootId)
        .map((ms) => ms.moduleId);

      let wrapperModuleId: string | null = null;

      if (topLevelModuleIds.length === 1) {
        wrapperModuleId = topLevelModuleIds[0];
        const children = plan.moduleSelections
          .filter((ms) => ms.parentModuleId === wrapperModuleId)
          .map((ms) => ms.moduleId);
        if (children.length > 0) topLevelModuleIds = children;
      }

      if (topLevelModuleIds.length === 0) return { modules: [], totalTarget: 0 };

      const cuToTopModule = buildCuToTopModuleMap(plan);

      const cuAttainments = (attainmentsQuery.data ?? []).filter(
        (a): a is CourseUnitAttainmentRestricted =>
          a.type === 'CourseUnitAttainment' && a.state !== 'FAILED' && a.primary,
      );

      const creditsByModule = new Map<string, number>();
      for (const att of cuAttainments) {
        const moduleId = cuToTopModule.get(att.courseUnitId);
        if (moduleId) {
          creditsByModule.set(moduleId, (creditsByModule.get(moduleId) ?? 0) + att.credits);
        }
      }

      const plannedCuIds = plan.courseUnitSelections
        .filter((cs) => cuToTopModule.has(cs.courseUnitId))
        .map((cs) => cs.courseUnitId);

      const [moduleDetails, wrapperDetails, plannedCuDetails] = await Promise.all([
        Promise.all(topLevelModuleIds.map(resolveModule)),
        wrapperModuleId ? resolveModule(wrapperModuleId) : Promise.resolve(null),
        Promise.all(plannedCuIds.map(resolveCourseUnit)),
      ]);

      const plannedCreditsByModule = new Map<string, number>();
      plannedCuIds.forEach((cuId, i) => {
        const moduleId = cuToTopModule.get(cuId)!;
        plannedCreditsByModule.set(
          moduleId,
          (plannedCreditsByModule.get(moduleId) ?? 0) + (plannedCuDetails[i].credits ?? 0),
        );
      });

      const modules = topLevelModuleIds.map((moduleId, i) => ({
        moduleId,
        name: moduleDetails[i].name,
        done: creditsByModule.get(moduleId) ?? 0,
        target: plannedCreditsByModule.get(moduleId) ?? moduleDetails[i].targetCredits,
      }));

      const totalTarget = wrapperDetails?.targetCredits ?? modules.reduce((s, m) => s + m.target, 0);

      return { modules, totalTarget };
    },
    { enabled: plansQuery.data != null && attainmentsQuery.data != null },
  );

  return {
    modules: result?.modules ?? [],
    totalTarget: result?.totalTarget ?? 0,
    isLoading: plansQuery.isLoading || attainmentsQuery.isLoading || modulesLoading,
  };
};
