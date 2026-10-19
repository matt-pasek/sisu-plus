import { useCallback, useMemo, useState } from 'react';
import {
  deleteDayAction,
  draftFromEvent,
  hasErrors,
  newNoteDraft,
  noteChangeFor,
  PENDING_NOTE_PREFIX,
  validateNoteDraft,
} from '@/app/api/dataPoints/calendar/notes';
import type { NoteChange, NoteDraft } from '@/app/api/dataPoints/calendar/types';
import { useNoteMutations } from '@/app/api/dataPoints/calendar/useNoteMutations';
import type { CalendarEvent } from '@/app/api/generated/IlmoApi';
import type { DateRange, NoteOccurrence } from '@/app/schedule';
import type { AnchorRect, NoteController, NoteEditorState, NotePopoverState, NoteSlot } from '../types';

export const useNoteController = (
  events: CalendarEvent[],
  range: DateRange,
  onFailed: (change: NoteChange) => void,
  onCreated: () => void,
): NoteController => {
  const { mutate } = useNoteMutations(onFailed);
  const [popover, setPopover] = useState<NotePopoverState | null>(null);
  const [editor, setEditor] = useState<NoteEditorState | null>(null);
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
  const openNew = useCallback(
    (slot: NoteSlot, anchor: AnchorRect, returnFocus: HTMLElement | null) => {
      setPopover(null);
      setEditor({
        draft: newNoteDraft(slot.dateKey, slot.startMinutes, slot.endMinutes, range),
        noteId: null,
        base: null,
        anchor,
        returnFocus,
        attempted: false,
      });
    },
    [range],
  );
  const edit = useCallback(
    (note: NoteOccurrence) => {
      const event = eventsById.get(note.noteId);
      if (!event || !popover) return;
      setEditor({
        draft: draftFromEvent(event, range),
        noteId: note.noteId,
        base: event,
        anchor: popover.anchor,
        returnFocus: popover.element,
        attempted: false,
      });
      setPopover(null);
    },
    [eventsById, popover, range],
  );
  const changeDraft = useCallback(
    (draft: NoteDraft) => setEditor((current) => (current ? { ...current, draft } : current)),
    [],
  );
  const cancel = useCallback(() => setEditor(null), []);
  const save = useCallback(() => {
    if (!editor) return;
    if (hasErrors(validateNoteDraft(editor.draft))) {
      setEditor({ ...editor, attempted: true });
      return;
    }
    mutate(noteChangeFor(editor.draft, editor.base, `${PENDING_NOTE_PREFIX}${Date.now()}`));
    if (editor.noteId == null) onCreated();
    setEditor(null);
  }, [editor, mutate, onCreated]);
  const closeOverlay = useCallback(() => {
    setPopover(null);
    setEditor(null);
  }, []);
  const draftSlot = useMemo<NoteSlot | null>(
    () =>
      editor && editor.noteId == null
        ? {
            dateKey: editor.draft.dateKey,
            startMinutes: editor.draft.startMinutes,
            endMinutes: editor.draft.endMinutes,
          }
        : null,
    [editor],
  );

  return {
    popover,
    editor,
    eventsById,
    draftSlot,
    openNote,
    closePopover,
    deleteDay,
    deleteSeries,
    openNew,
    edit,
    changeDraft,
    save,
    cancel,
    hasOverlay: popover != null || editor != null,
    closeOverlay,
  };
};
