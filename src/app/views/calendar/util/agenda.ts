import type { Session } from '@/app/schedule';
import type { AgendaModel, Countdown } from '../types';

const MINUTE_MS = 60_000;
const DAY_MINUTES = 24 * 60;

const byStart = (a: Session, b: Session): number => a.start.getTime() - b.start.getTime();

export const agendaFor = (attended: Session[], skipped: Session[], viewedKey: string, now: Date): AgendaModel => {
  const live = attended.filter((session) => !session.cancelled).sort(byStart);
  return {
    next: live.find((session) => session.end > now) ?? null,
    day: [...attended, ...skipped].filter((session) => session.dateKey === viewedKey).sort(byStart),
    following: live.find((session) => session.dateKey > viewedKey) ?? null,
  };
};

export const countdownTo = (session: Session, now: Date): Countdown => {
  if (session.start <= now) return { kind: 'now', until: session.end };
  const minutes = Math.ceil((session.start.getTime() - now.getTime()) / MINUTE_MS);
  return minutes < DAY_MINUTES ? { kind: 'soon', minutes } : { kind: 'later' };
};
