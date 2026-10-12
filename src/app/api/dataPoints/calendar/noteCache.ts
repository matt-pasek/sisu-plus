import type { CalendarEvent } from '@/app/api/generated/IlmoApi';
import type { NoteChange } from './types';

export const NOTES_KEY = ['calendar-notes'];

export const applyNoteChange = (events: CalendarEvent[], change: NoteChange): CalendarEvent[] => {
  switch (change.type) {
    case 'create':
      return [...events, change.event];
    case 'update':
      return events.map((event) => (event.id === change.event.id ? change.event : event));
    case 'delete':
      return events.filter((event) => event.id !== change.noteId);
  }
};

export const withoutId = (event: CalendarEvent): CalendarEvent => ({ ...event, id: undefined });

export const noteStillExists = (lists: (CalendarEvent[] | undefined)[], noteId: string): boolean =>
  lists.some((events) => events?.some((event) => event.id === noteId) ?? false);
