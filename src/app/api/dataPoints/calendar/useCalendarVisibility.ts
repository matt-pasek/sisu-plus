import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { fetchEnrolmentsByRealisations, updateOwnEnrolment, type Enrolment } from '@/app/api/endpoints/enrolments';
import type { CalendarRowsResult, VisibilityChange } from './types';
import { applyVisibilityToEnrolments, applyVisibilityToRows, withCalendarFlags } from './visibility';

const ROWS_KEY = ['calendar-rows'];
const ENROLMENTS_KEY = ['enrolments'];
export const VISIBILITY_MUTATION_SCOPE = 'calendar-visibility';

interface Snapshot {
  rows: [QueryKey, CalendarRowsResult | undefined][];
  enrolments: [QueryKey, Enrolment[] | undefined][];
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
    scope: { id: VISIBILITY_MUTATION_SCOPE },
    onMutate: async (change) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ROWS_KEY }),
        queryClient.cancelQueries({ queryKey: ENROLMENTS_KEY }),
      ]);
      const rows = queryClient.getQueriesData<CalendarRowsResult>({ queryKey: ROWS_KEY });
      const enrolments = queryClient.getQueriesData<Enrolment[]>({ queryKey: ENROLMENTS_KEY });
      queryClient.setQueriesData<CalendarRowsResult>({ queryKey: ROWS_KEY }, (data) =>
        data ? applyVisibilityToRows(data, change) : data,
      );
      // Courses Sisu leaves out of the calendar rows take their flags from the enrolments.
      queryClient.setQueriesData<Enrolment[]>({ queryKey: ENROLMENTS_KEY }, (data) =>
        data ? applyVisibilityToEnrolments(data, change) : data,
      );
      return { rows, enrolments };
    },
    onError: (_error, _change, context) => {
      context?.rows.forEach(([key, data]) => queryClient.setQueryData(key, data));
      context?.enrolments.forEach(([key, data]) => queryClient.setQueryData(key, data));
      onError();
    },
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ROWS_KEY }),
        queryClient.invalidateQueries({ queryKey: ENROLMENTS_KEY }),
      ]),
  });
};
