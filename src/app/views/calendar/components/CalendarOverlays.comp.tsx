import React from 'react';
import type { DeadlinePopoverState, NoteController } from '../types';
import { DeadlinePopover } from './DeadlinePopover.comp';
import { NoteEditor } from './NoteEditor.comp';
import { NotePopover } from './NotePopover.comp';

interface Props {
  notes: NoteController;
  deadline: DeadlinePopoverState | null;
  fallbackFocus: React.RefObject<HTMLElement>;
  now: Date;
  locale: string;
  onCloseDeadline: () => void;
}

export const CalendarOverlays: React.FC<Props> = ({ notes, deadline, fallbackFocus, now, locale, onCloseDeadline }) => {
  const { popover, editor } = notes;
  return (
    <>
      {popover && (
        <NotePopover
          key={popover.note.id}
          state={popover}
          event={notes.eventsById.get(popover.note.noteId)}
          fallbackFocus={fallbackFocus}
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
      {deadline && (
        <DeadlinePopover
          key={deadline.deadline.id}
          state={deadline}
          now={now}
          locale={locale}
          onClose={onCloseDeadline}
        />
      )}
    </>
  );
};
