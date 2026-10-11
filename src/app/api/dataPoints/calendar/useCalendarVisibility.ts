import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { fetchEnrolmentsByRealisations, updateOwnEnrolment, type Enrolment } from '@/app/api/endpoints/enrolments';
import type { CalendarRowsResult, VisibilityChange } from './types';
import { applyVisibilityToRows, withCalendarFlags } from './visibility';

const ROWS_KEY = ['calendar-rows'];

interface Snapshot {
  snapshots: [QueryKey, CalendarRowsResult | undefined][];
}

const writeVisibility = async (change: VisibilityChange): Promise<Enrolment> => {
  const enrolments = await fetchEnrolmentsByRealisations([change.courseKey]);
  const fresh = enrolments.find((enrolment) => enrolment.id === change.enrolmentId);
  if (!fresh) throw new Error('Sisu did not return this enrolment.');
  const next = withCalendarFlags(fresh, change);
  if (!next) throw new Error('This group is not listed on the enrolment.');
  return updateOwnEnrolment(change.enrolmentId, next);
};

export const useCalendarVisibility = (onError: () => void) => {
  const queryClient = useQueryClient();
  return useMutation<Enrolment, Error, VisibilityChange, Snapshot>({
    mutationFn: writeVisibility,
    scope: { id: 'calendar-visibility' },
    onMutate: async (change) => {
      await queryClient.cancelQueries({ queryKey: ROWS_KEY });
      const snapshots = queryClient.getQueriesData<CalendarRowsResult>({ queryKey: ROWS_KEY });
      queryClient.setQueriesData<CalendarRowsResult>({ queryKey: ROWS_KEY }, (rows) =>
        rows ? applyVisibilityToRows(rows, change) : rows,
      );
      return { snapshots };
    },
    onError: (_error, _change, context) => {
      context?.snapshots.forEach(([key, data]) => queryClient.setQueryData(key, data));
      onError();
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ROWS_KEY }),
  });
};
