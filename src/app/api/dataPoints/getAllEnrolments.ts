import { useSisuQuery } from '@/app/hooks/useSisuQuery';
import { fetchEnrolments } from '@/app/api/endpoints/enrolments';
import { resolveAllEnrolments } from '@/app/api/resolvers/resolveEnrolment';

export const getAllEnrolments = () => {
  const enrolments = useSisuQuery(['enrolments'], fetchEnrolments);
  const { data: resolvedEnrolments, isLoading } = useSisuQuery(
    ['enrolments-resolved'],
    () => resolveAllEnrolments(enrolments.data!),
    {
      enabled: enrolments.data != null && enrolments.data.length > 0,
    },
  );

  return { resolvedEnrolments, isLoading };
};
