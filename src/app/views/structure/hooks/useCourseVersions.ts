import { fetchCourseUnitsByGroupIds } from '@/app/api/endpoints/courseUnit';
import { useSisuQuery } from '@/app/hooks/useSisuQuery';

export function useCourseVersions(groupId: string | undefined) {
  return useSisuQuery(
    ['course-versions', groupId],
    async () => {
      const units = await fetchCourseUnitsByGroupIds([groupId!]);
      return units
        .filter((unit) => unit.documentState !== 'DELETED')
        .sort((a, b) => {
          const aStart = a.validityPeriod?.startDate ?? '';
          const bStart = b.validityPeriod?.startDate ?? '';
          return aStart.localeCompare(bStart);
        });
    },
    { enabled: groupId != null },
  );
}
