import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createShareToken, removeShareToken } from '@/app/api/endpoints/calendarShareToken';
import { useSisuQuery } from '@/app/hooks/useSisuQuery';
import { readShareToken, resolveShareToken, saveShareToken } from './shareTokenCache';
import type { ShareLink } from './types';

const SHARE_KEY = ['calendar-share-token'];

interface Callbacks {
  onResetDone: () => void;
  onResetFailed: () => void;
}

const createToken = async (language: string): Promise<string | null> =>
  (await createShareToken(language)).token ?? null;

// Every POST to Sisu mints another live token, so the first one is kept and shown on every open.
export const useShareLink = (language: string, { onResetDone, onResetFailed }: Callbacks): ShareLink => {
  const queryClient = useQueryClient();
  const origin = window.location.origin;
  const query = useSisuQuery(
    [...SHARE_KEY, origin],
    async () => {
      const resolved = await resolveShareToken(await readShareToken(origin), () => createToken(language));
      if (resolved.created && resolved.token) await saveShareToken(origin, resolved.token);
      return resolved.token;
    },
    { staleTime: Infinity, gcTime: Infinity },
  );
  const current = query.data ?? null;
  const reset = useMutation<string | null, Error, void>({
    mutationFn: async () => {
      if (current) await removeShareToken(current);
      const token = await createToken(language);
      if (token) await saveShareToken(origin, token);
      return token;
    },
    onSuccess: (token) => {
      queryClient.setQueriesData<string | null>({ queryKey: SHARE_KEY }, token);
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
