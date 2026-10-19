import { useMemo } from 'react';
import { useMutationState } from '@tanstack/react-query';
import type { VisibilityChange } from './types';
import { VISIBILITY_MUTATION_SCOPE } from './useCalendarVisibility';
import { pendingGroupIds } from './visibility';

export const usePendingVisibility = (): Set<string> => {
  const pending = useMutationState({
    filters: {
      status: 'pending',
      predicate: (mutation) => mutation.options.scope?.id === VISIBILITY_MUTATION_SCOPE,
    },
    select: (mutation) => mutation.state.variables as VisibilityChange | undefined,
  });
  return useMemo(() => pendingGroupIds(pending), [pending]);
};
