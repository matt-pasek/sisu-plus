import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createShareToken, removeShareToken } from '@/app/api/endpoints/calendarShareToken';
import type { CalendarShareToken } from '@/app/api/generated/IlmoApi';
import { useSisuQuery } from '@/app/hooks/useSisuQuery';
import type { ShareLink } from './types';

const SHARE_KEY = ['calendar-share-token'];

interface Callbacks {
  onResetDone: () => void;
  onResetFailed: () => void;
}

export const useShareLink = (language: string, { onResetDone, onResetFailed }: Callbacks): ShareLink => {
  const queryClient = useQueryClient();
  const query = useSisuQuery([...SHARE_KEY, language], () => createShareToken(language), {
    staleTime: Infinity,
    gcTime: Infinity,
  });
  const current = query.data?.token ?? null;
  const reset = useMutation<CalendarShareToken, Error, void>({
    mutationFn: async () => {
      if (current) await removeShareToken(current);
      return createShareToken(language);
    },
    onSuccess: (token) => {
      queryClient.setQueriesData<CalendarShareToken>({ queryKey: SHARE_KEY }, token);
      onResetDone();
    },
    onError: onResetFailed,
  });
  return {
    token: current,
    isLoading: query.isLoading,
    isError: query.isError,
    retry: () => {
      void query.refetch();
    },
    reset: () => reset.mutate(),
    isResetting: reset.isPending,
  };
};
