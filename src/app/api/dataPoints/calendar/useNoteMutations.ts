import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { createCalendarEvent, removeCalendarEvent, updateCalendarEvent } from '@/app/api/endpoints/calendarEvents';
import type { CalendarEvent } from '@/app/api/generated/IlmoApi';
import { applyNoteChange, noteStillExists, NOTES_KEY, withoutId } from './noteCache';
import type { NoteChange } from './types';

type Snapshot = [QueryKey, CalendarEvent[] | undefined][];

const sendNoteChange = async (change: NoteChange): Promise<void> => {
  if (change.type === 'create') {
    await createCalendarEvent(withoutId(change.event));
    return;
  }
  if (change.type === 'update') {
    if (!change.event.id) throw new Error('A note without an id cannot be updated.');
    await updateCalendarEvent(change.event.id, change.event);
    return;
  }
  await removeCalendarEvent(change.noteId);
};

export const useNoteMutations = (onError: (change: NoteChange) => void) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, NoteChange, Snapshot>({
    mutationFn: sendNoteChange,
    scope: { id: 'calendar-notes' },
    onMutate: async (change) => {
      await queryClient.cancelQueries({ queryKey: NOTES_KEY });
      const snapshot = queryClient.getQueriesData<CalendarEvent[]>({ queryKey: NOTES_KEY });
      queryClient.setQueriesData<CalendarEvent[]>({ queryKey: NOTES_KEY }, (events) =>
        events ? applyNoteChange(events, change) : events,
      );
      return snapshot;
    },
    onError: async (_error, change, snapshot) => {
      snapshot?.forEach(([key, events]) => queryClient.setQueryData(key, events));
      // Sisu answers DELETE with 503 even when the note is gone, so fresh data decides whether it failed.
      if (change.type === 'delete') {
        await queryClient.refetchQueries({ queryKey: NOTES_KEY });
        const lists = queryClient.getQueriesData<CalendarEvent[]>({ queryKey: NOTES_KEY }).map(([, events]) => events);
        if (!noteStillExists(lists, change.noteId)) return;
      }
      onError(change);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: NOTES_KEY }),
  });
};
