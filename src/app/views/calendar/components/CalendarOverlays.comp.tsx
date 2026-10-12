import React from 'react';
import type { NoteController } from '../types';
import { NoteEditor } from './NoteEditor.comp';
import { NotePopover } from './NotePopover.comp';

interface Props {
  notes: NoteController;
  locale: string;
}

export const CalendarOverlays: React.FC<Props> = ({ notes, locale }) => {
  const { popover, editor } = notes;
  return (
    <>
      {popover && (
        <NotePopover
          key={popover.note.id}
          state={popover}
          event={notes.eventsById.get(popover.note.noteId)}
          locale={locale}
          onEdit={() => notes.edit(popover.note)}
          onDeleteDay={() => notes.deleteDay(popover.note)}
          onDeleteSeries={() => notes.deleteSeries(popover.note)}
          onClose={notes.closePopover}
        />
      )}
      {editor && (
        <NoteEditor
          key={editor.noteId ?? 'new'}
          state={editor}
          onChange={notes.changeDraft}
          onSave={notes.save}
          onCancel={notes.cancel}
        />
      )}
    </>
  );
};
