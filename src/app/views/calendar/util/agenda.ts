import { helsinkiDateKey, type DateRange, type NoteOccurrence, type Session } from '@/app/schedule';
import type { AgendaEntry, AgendaModel, Countdown } from '../types';

const MINUTE_MS = 60_000;
const DAY_MINUTES = 24 * 60;

const byStart = (a: Session, b: Session): number => a.start.getTime() - b.start.getTime();

// Only the loaded term's sessions are known, so the next class is only knowable when today falls inside it.
export const agendaFor = (
  attended: Session[],
  skipped: Session[],
  viewedKey: string,
  now: Date,
  range: DateRange,
): AgendaModel => {
  const live = attended.filter((session) => !session.cancelled).sort(byStart);
  const todayKey = helsinkiDateKey(now);
  const nextKnown = todayKey >= range.startKey && todayKey < range.endKey;
  return {
    next: nextKnown ? (live.find((session) => session.end > now) ?? null) : null,
    nextKnown,
    day: [...attended, ...skipped].filter((session) => session.dateKey === viewedKey).sort(byStart),
    following: live.find((session) => session.dateKey > viewedKey) ?? null,
  };
};

export const countdownTo = (session: Session, now: Date): Countdown => {
  if (session.start <= now) return { kind: 'now', until: session.end };
  const minutes = Math.ceil((session.start.getTime() - now.getTime()) / MINUTE_MS);
  return minutes < DAY_MINUTES ? { kind: 'soon', minutes } : { kind: 'later' };
};

const entryStart = (entry: AgendaEntry): number =>
  (entry.type === 'session' ? entry.session.start : entry.note.start).getTime();

export const mergeDay = (sessions: Session[], notes: NoteOccurrence[]): AgendaEntry[] =>
  [
    ...sessions.map((session): AgendaEntry => ({ type: 'session', session })),
    ...notes.map((note): AgendaEntry => ({ type: 'note', note })),
  ].sort((a, b) => entryStart(a) - entryStart(b));
