import React from 'react';
import type { NoteController } from '../types';
import { NotePopover } from './NotePopover.comp';

interface Props {
  notes: NoteController;
  locale: string;
}

export const CalendarOverlays: React.FC<Props> = ({ notes, locale }) => {
  const { popover } = notes;
  return (
    <>
      {popover && (
        <NotePopover
          key={popover.note.id}
          state={popover}
          event={notes.eventsById.get(popover.note.noteId)}
          locale={locale}
          onDeleteDay={() => notes.deleteDay(popover.note)}
          onDeleteSeries={() => notes.deleteSeries(popover.note)}
          onClose={notes.closePopover}
        />
      )}
    </>
  );
};
