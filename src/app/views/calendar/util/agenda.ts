import { daysBetween, helsinkiDateKey, type DateRange, type NoteOccurrence, type Session } from '@/app/schedule';
import type { AgendaEntry, AgendaModel, Countdown } from '../types';
import { formatClock } from './format';

const MINUTE_MS = 60_000;
const HOUR_MINUTES = 60;
const DAY_MINUTES = 24 * HOUR_MINUTES;

const byStart = (a: Session, b: Session): number => a.start.getTime() - b.start.getTime();

// Only the loaded term's sessions are known, so the next class is only knowable when today falls inside it.
export const agendaFor = (
  attended: Session[],
  skipped: Session[],
  viewedKey: string,
  now: Date,
  range: DateRange,
  showCancelled = true,
): AgendaModel => {
  const live = attended.filter((session) => !session.cancelled).sort(byStart);
  const todayKey = helsinkiDateKey(now);
  const nextKnown = todayKey >= range.startKey && todayKey < range.endKey;
  const next = nextKnown && viewedKey === todayKey ? (live.find((session) => session.end > now) ?? null) : null;
  const following = live.find((session) => session.dateKey > viewedKey) ?? null;
  return {
    next,
    nextKnown,
    day: [...attended, ...skipped]
      .filter((session) => session.dateKey === viewedKey && (showCancelled || !session.cancelled))
      .sort(byStart),
    following: following && following.id !== next?.id ? following : null,
  };
};

export const countdownTo = (session: Session, now: Date): Countdown => {
  if (session.start <= now) return { kind: 'now', until: session.end };
  const minutes = Math.ceil((session.start.getTime() - now.getTime()) / MINUTE_MS);
  return minutes < DAY_MINUTES
    ? { kind: 'soon', minutes }
    : { kind: 'later', days: daysBetween(helsinkiDateKey(now), session.dateKey) };
};

export const countdownKey = (countdown: Countdown): { key: string; params: Record<string, string | number> } => {
  if (countdown.kind === 'now') return { key: 'agenda.until', params: { time: formatClock(countdown.until) } };
  if (countdown.kind === 'later') {
    return countdown.days <= 1
      ? { key: 'agenda.tomorrow', params: {} }
      : { key: 'agenda.inDays', params: { count: countdown.days } };
  }
  if (countdown.minutes < HOUR_MINUTES) return { key: 'agenda.inMinutes', params: { minutes: countdown.minutes } };
  const hours = Math.floor(countdown.minutes / HOUR_MINUTES);
  const minutes = countdown.minutes % HOUR_MINUTES;
  return minutes === 0
    ? { key: 'agenda.inWholeHours', params: { hours } }
    : { key: 'agenda.inHours', params: { hours, minutes } };
};

const entryStart = (entry: AgendaEntry): number =>
  (entry.type === 'session' ? entry.session.start : entry.note.start).getTime();

export const mergeDay = (sessions: Session[], notes: NoteOccurrence[]): AgendaEntry[] =>
  [
    ...sessions.map((session): AgendaEntry => ({ type: 'session', session })),
    ...notes.map((note): AgendaEntry => ({ type: 'note', note })),
  ].sort((a, b) => entryStart(a) - entryStart(b));
