import type { UseQueryResult } from '@tanstack/react-query';

export const isQuerySettled = (query: Pick<UseQueryResult, 'isSuccess' | 'isFetching'>): boolean =>
  query.isSuccess && !query.isFetching;
