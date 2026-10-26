import { useMemo } from 'react';
import { resolveUniversityName } from '@/app/api/resolvers/resolveUniversityName';
import { useSisuQuery } from '@/app/hooks/useSisuQuery';

const NO_NAMES = new Map<string, string>();

export const getUniversityNames = (orgIds: string[]): Map<string, string> => {
  const ids = useMemo(() => [...new Set(orgIds)].sort(), [orgIds]);
  const { data } = useSisuQuery(
    ['university-names', ids.join(',')],
    async () => {
      const names = await Promise.all(ids.map(async (id) => [id, await resolveUniversityName(id)] as const));
      return new Map(names.filter((entry): entry is readonly [string, string] => entry[1] !== null));
    },
    { enabled: ids.length > 0, staleTime: Infinity },
  );
  return data ?? NO_NAMES;
};
