import { useQuery, type UseQueryOptions, type UseQueryResult } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

type Options<T> = Omit<UseQueryOptions<T, Error>, 'queryKey' | 'queryFn'>;

export function useSisuQuery<T>(
  queryKey: unknown[],
  queryFn: () => Promise<T>,
  options?: Options<T>,
): UseQueryResult<T, Error> {
  const { i18n } = useTranslation();
  return useQuery<T, Error>({ queryKey: [...queryKey, i18n.language], queryFn, retry: 1, ...options });
}
