import type { RecurrenceRule } from '@/app/schedule';

export type CalendarNotesTranslation = {
  layer: string;
  unavailable: string;
  retry: string;
  add: string;
  newTitle: string;
  editTitle: string;
  fields: { title: string; date: string; start: string; end: string; repeat: string; until: string };
  titlePlaceholder: string;
  repeat: Record<RecurrenceRule, string>;
  summary: Record<RecurrenceRule, string>;
  errors: { required: string; endBeforeStart: string; beforeDate: string; tooFar: string };
  save: string;
  cancel: string;
  edit: string;
  delete: string;
  deleteQuestion: string;
  deleteDay: string;
  deleteSeries: string;
  keep: string;
  failed: { create: string; update: string; delete: string };
  aria: string;
  monthLine: string;
  agendaSubtitle: string;
  helsinkiNote: string;
  pending: string;
};

export const calendarNotesTranslation: CalendarNotesTranslation = {
  layer: 'Notes',
  unavailable: 'Notes unavailable',
  retry: 'Retry',
  add: 'Add a note',
  newTitle: 'New note',
  editTitle: 'Edit note',
  fields: { title: 'Title', date: 'Date', start: 'Start', end: 'End', repeat: 'Repeat', until: 'Until' },
  titlePlaceholder: 'What is it?',
  repeat: {
    NEVER: 'Never',
    DAILY: 'Daily',
    WEEKLY: 'Weekly',
    EVERY_SECOND_WEEK: 'Every 2 weeks',
    MONTHLY: 'Monthly',
  },
  summary: {
    NEVER: 'Does not repeat',
    DAILY: 'Daily until {{date}}',
    WEEKLY: 'Weekly until {{date}}',
    EVERY_SECOND_WEEK: 'Every 2 weeks until {{date}}',
    MONTHLY: 'Monthly until {{date}}',
  },
  errors: {
    required: 'Give the note a title.',
    endBeforeStart: 'End must be after start on the same day.',
    beforeDate: "Until can't be before the date.",
    tooFar: 'A note can repeat for at most a year.',
  },
  save: 'Save',
  cancel: 'Cancel',
  edit: 'Edit',
  delete: 'Delete',
  deleteQuestion: 'Delete this note?',
  deleteDay: 'Only this day',
  deleteSeries: 'Whole series',
  keep: 'Keep',
  failed: {
    create: "Couldn't save the note.",
    update: "Couldn't save your changes.",
    delete: "Couldn't delete the note.",
  },
  aria: 'Note: {{name}}, {{date}} {{start}} to {{end}}',
  monthLine: '{{time}} {{name}}',
  agendaSubtitle: 'Note',
  helsinkiNote: 'Times are Finnish time.',
  pending: 'Saving…',
};
