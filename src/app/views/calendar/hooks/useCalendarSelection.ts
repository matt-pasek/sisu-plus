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
  const { target: deadline, open: openDeadline, close: closeDeadline } = useDeadlinePopover();
  const selectSession = useCallback(
    (session: Session, element: HTMLElement) => {
      closeNotePopover();
      closeDeadline();
      setPopover({ session, element });
    },
    [closeNotePopover, closeDeadline, setPopover],
  );
  const selectNote = useCallback(
    (note: NoteOccurrence, element: HTMLElement) => {
      setPopover(null);
      closeDeadline();
      openNote(note, element);
    },
    [openNote, closeDeadline, setPopover],
  );
  const selectDeadline = useCallback(
    (selected: CalendarDeadline, element: HTMLElement) => {
      setPopover(null);
      closeNotePopover();
      openDeadline(selected, element);
    },
    [closeNotePopover, openDeadline, setPopover],
  );
  const draftNote = useCallback((slot: NoteSlot, anchor: AnchorRect) => openNew(slot, anchor, null), [openNew]);
  const closeTransient = useCallback(() => {
    setPopover(null);
    closeNotePopover();
    closeDeadline();
  }, [closeNotePopover, closeDeadline, setPopover]);
  return { selectSession, selectNote, selectDeadline, draftNote, closeTransient, deadline, closeDeadline };
};
