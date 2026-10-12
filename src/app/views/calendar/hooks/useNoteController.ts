import { useCallback, useMemo, useState } from 'react';
import { deleteDayAction } from '@/app/api/dataPoints/calendar/notes';
import type { NoteChange } from '@/app/api/dataPoints/calendar/types';
import { useNoteMutations } from '@/app/api/dataPoints/calendar/useNoteMutations';
import type { CalendarEvent } from '@/app/api/generated/IlmoApi';
import type { DateRange, NoteOccurrence } from '@/app/schedule';
import type { NoteController, NotePopoverState } from '../types';

export const useNoteController = (
  events: CalendarEvent[],
  _range: DateRange,
  onFailed: (change: NoteChange) => void,
): NoteController => {
  const { mutate } = useNoteMutations(onFailed);
  const [popover, setPopover] = useState<NotePopoverState | null>(null);
  const eventsById = useMemo(
    () => new Map(events.flatMap((event): [string, CalendarEvent][] => (event.id ? [[event.id, event]] : []))),
    [events],
  );

  const openNote = useCallback((note: NoteOccurrence, element: HTMLElement) => {
    setPopover({ note, element, anchor: element.getBoundingClientRect() });
  }, []);
  const closePopover = useCallback(() => setPopover(null), []);
  const deleteDay = useCallback(
    (note: NoteOccurrence) => {
      setPopover(null);
      const event = eventsById.get(note.noteId);
      if (!event) return;
      const action = deleteDayAction(event, note.dateKey);
      mutate(
        action.type === 'delete' ? { type: 'delete', noteId: action.noteId } : { type: 'update', event: action.event },
      );
    },
    [eventsById, mutate],
  );
  const deleteSeries = useCallback(
    (note: NoteOccurrence) => {
      setPopover(null);
      mutate({ type: 'delete', noteId: note.noteId });
    },
    [mutate],
  );

  return {
    popover,
    eventsById,
    openNote,
    closePopover,
    deleteDay,
    deleteSeries,
    hasOverlay: popover != null,
    closeOverlay: closePopover,
  };
};
