import type { TimetableFailure } from './TimetableFailure.type';

export type TimetableFetchResult = { ok: true; text: string } | { ok: false; reason: TimetableFailure };
