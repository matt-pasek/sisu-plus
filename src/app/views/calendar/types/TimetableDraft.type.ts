import type { LinkedImport, Session } from '@/app/schedule';
import type { TimetableFailure } from '@/shared/timetables/TimetableFailure.type';

export type TimetableDraft =
  | { step: 'idle' }
  | { step: 'invalid' }
  | { step: 'loading'; url: string }
  | { step: 'permission'; url: string; waiting: boolean }
  | { step: 'preview'; url: string; imported: LinkedImport; sessions: Session[] }
  | { step: 'failed'; url: string; reason: TimetableFailure };
