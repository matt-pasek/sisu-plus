import { useQuery, type UseQueryOptions, type UseQueryResult } from '@tanstack/react-query';

type Options<T> = Omit<UseQueryOptions<T, Error>, 'queryKey' | 'queryFn'>;

export function useSisuQuery<T>(
  queryKey: unknown[],
  queryFn: () => Promise<T>,
  options?: Options<T>,
): UseQueryResult<T, Error> {
  return useQuery<T, Error>({ queryKey, queryFn, retry: 1, ...options });
}
