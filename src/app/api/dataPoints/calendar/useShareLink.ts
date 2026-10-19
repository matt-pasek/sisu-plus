import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createShareToken, removeShareToken } from '@/app/api/endpoints/calendarShareToken';
import { useSisuQuery } from '@/app/hooks/useSisuQuery';
import {
  clearShareToken,
  isNotFound,
  readShareToken,
  resolveShareToken,
  saveShareToken,
  shareTokenKey,
} from './shareTokenCache';
import type { ShareLink } from './types';

const SHARE_KEY = ['calendar-share-token'];

interface Callbacks {
  onResetDone: () => void;
  onResetFailed: () => void;
}

const createToken = async (language: string): Promise<string | null> =>
  (await createShareToken(language)).token ?? null;

// Every POST to Sisu mints another live token, so the first one is kept per student and shown on every open.
export const useShareLink = (
  personId: string | null,
  language: string,
  { onResetDone, onResetFailed }: Callbacks,
): ShareLink => {
  const queryClient = useQueryClient();
  const key = personId ? shareTokenKey(window.location.origin, personId) : null;
  const query = useSisuQuery(
    [...SHARE_KEY, key],
    async () => {
      if (!key) return null;
      const resolved = await resolveShareToken(await readShareToken(key), () => createToken(language));
      if (resolved.created && resolved.token) await saveShareToken(key, resolved.token);
      return resolved.token;
    },
    { enabled: key != null, staleTime: Infinity, gcTime: Infinity },
  );
  const current = query.data ?? null;
  const reset = useMutation<string | null, Error, void>({
    mutationFn: async () => {
      if (!key) return null;
      if (current) {
        try {
          await removeShareToken(current);
        } catch (error) {
          if (!isNotFound(error)) throw error;
        }
        await clearShareToken(key);
      }
      const token = await createToken(language);
      if (token) await saveShareToken(key, token);
      return token;
    },
    onSuccess: (token) => {
      queryClient.setQueriesData<string | null>({ queryKey: [...SHARE_KEY, key] }, token);
      if (!token) void queryClient.invalidateQueries({ queryKey: [...SHARE_KEY, key] });
      onResetDone();
    },
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: [...SHARE_KEY, key] });
      onResetFailed();
    },
  });
  return {
    token: current,
    isLoading: key == null || query.isLoading,
    isError: query.isError,
    retry: () => {
      void query.refetch();
    },
    reset: () => reset.mutate(),
    isResetting: reset.isPending,
  };
};
