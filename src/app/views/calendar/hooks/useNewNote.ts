import { useCallback, useRef } from 'react';
import type { DateRange, NoteOccurrence, Session } from '@/app/schedule';
import type { NoteController } from '../types';
import { slotInView } from '../util';

interface Options {
  attended: Session[];
  notes: NoteOccurrence[];
  openNew: NoteController['openNew'];
  range: DateRange;
  todayKey: string;
  now: Date;
}

export const useNewNote = ({ attended, notes, openNew, range, todayKey, now }: Options) => {
  const addNoteRef = useRef<HTMLButtonElement>(null);
  const openNewNote = useCallback(
    (element: HTMLElement) => {
      const busy = [...attended.filter((session) => !session.cancelled), ...notes];
      openNew(slotInView(busy, range, todayKey, now), element.getBoundingClientRect(), element);
    },
    [attended, notes, openNew, range, todayKey, now],
  );
  const newNoteFromKeyboard = useCallback(() => {
    if (addNoteRef.current) openNewNote(addNoteRef.current);
  }, [openNewNote]);
  return { addNoteRef, openNewNote, newNoteFromKeyboard };
};
