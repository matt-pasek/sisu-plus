import { useCallback } from 'react';
import type { NoteOccurrence, Session } from '@/app/schedule';
import type { AnchorRect, NoteController, NoteSlot, PopoverTarget } from '../types';

interface Options {
  notes: NoteController;
  setPopover: (target: PopoverTarget | null) => void;
}

export const useCalendarSelection = ({ notes, setPopover }: Options) => {
  const { closePopover: closeNotePopover, openNote, openNew } = notes;
  const selectSession = useCallback(
    (session: Session, element: HTMLElement) => {
      closeNotePopover();
      setPopover({ session, element });
    },
    [closeNotePopover, setPopover],
  );
  const selectNote = useCallback(
    (note: NoteOccurrence, element: HTMLElement) => {
      setPopover(null);
      openNote(note, element);
    },
    [openNote, setPopover],
  );
  const draftNote = useCallback((slot: NoteSlot, anchor: AnchorRect) => openNew(slot, anchor, null), [openNew]);
  const closeTransient = useCallback(() => {
    setPopover(null);
    closeNotePopover();
  }, [closeNotePopover, setPopover]);
  return { selectSession, selectNote, draftNote, closeTransient };
};
