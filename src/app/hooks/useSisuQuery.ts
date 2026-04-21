import { useQuery, type UseQueryOptions, type UseQueryResult } from '@tanstack/react-query';
import { sisuRequest } from '@/app/api/client';

type SisuQueryOptions<T> = Omit<UseQueryOptions<T, Error>, 'queryFn'>;

export function useSisuQuery<T>(
  endpoint: string,
  params?: Record<string, string>,
  options?: SisuQueryOptions<T>,
): UseQueryResult<T, Error> {
  return useQuery<T, Error>({
    queryKey: [endpoint, params],
    queryFn: () => sisuRequest<T>(endpoint, params),
    retry: 1,
    ...options,
  });
}
