import { useCallback } from 'react';
import type { CalendarDeadline } from '@/app/api/dataPoints/calendar/types';
import type { NoteOccurrence, Session } from '@/app/schedule';
import type { AnchorRect, NoteController, NoteSlot, PopoverTarget } from '../types';
import { useDeadlinePopover } from './useDeadlinePopover';

interface Options {
  notes: NoteController;
  setPopover: (target: PopoverTarget | null) => void;
}

export const useCalendarSelection = ({ notes, setPopover }: Options) => {
  const { closePopover: closeNotePopover, openNote, openNew } = notes;
  // The editor ignores outside clicks so typed text survives; selecting something else must not replace it either.
  const editing = notes.editor != null;
  const { target: deadline, open: openDeadline, close: closeDeadline } = useDeadlinePopover();
  const selectSession = useCallback(
    (session: Session, element: HTMLElement) => {
      if (editing) return;
      closeNotePopover();
      closeDeadline();
      setPopover({ session, element });
    },
    [editing, closeNotePopover, closeDeadline, setPopover],
  );
  const selectNote = useCallback(
    (note: NoteOccurrence, element: HTMLElement) => {
      if (editing) return;
      setPopover(null);
      closeDeadline();
      openNote(note, element);
    },
    [editing, openNote, closeDeadline, setPopover],
  );
  const selectDeadline = useCallback(
    (selected: CalendarDeadline, element: HTMLElement) => {
      if (editing) return;
      setPopover(null);
      closeNotePopover();
      openDeadline(selected, element);
    },
    [editing, closeNotePopover, openDeadline, setPopover],
  );
  const draftNote = useCallback((slot: NoteSlot, anchor: AnchorRect) => openNew(slot, anchor, null), [openNew]);
  const closeTransient = useCallback(() => {
    setPopover(null);
    closeNotePopover();
    closeDeadline();
  }, [closeNotePopover, closeDeadline, setPopover]);
  return { selectSession, selectNote, selectDeadline, draftNote, closeTransient, deadline, closeDeadline };
};
