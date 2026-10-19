import type { CalendarEvent } from '@/app/api/generated/IlmoApi';

export type NoteChange =
  | { type: 'create'; event: CalendarEvent }
  | { type: 'update'; event: CalendarEvent }
  | { type: 'delete'; noteId: string };
