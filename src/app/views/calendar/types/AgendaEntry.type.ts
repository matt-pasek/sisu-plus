import type { NoteOccurrence, Session } from '@/app/schedule';

export type AgendaEntry = { type: 'session'; session: Session } | { type: 'note'; note: NoteOccurrence };
