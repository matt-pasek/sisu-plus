import type { IcsEvent } from 'ts-ics';

const PAST_DUE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

const getDueTime = (event: IcsEvent): number => (event.end?.date ?? event.start.date).getTime();

const byDueTime = (first: IcsEvent, second: IcsEvent): number => getDueTime(first) - getDueTime(second);

export const isPastDue = (event: IcsEvent, now: Date): boolean => getDueTime(event) <= now.getTime();

// The Moodle export has no submission state, so a past deadline may already be done; the past week stays visible, worded neutrally.
export const getVisibleDeadlines = (events: IcsEvent[], now: Date): IcsEvent[] =>
  events.filter((event) => getDueTime(event) > now.getTime() - PAST_DUE_WINDOW_MS).sort(byDueTime);

export const getUpcomingDeadlines = (events: IcsEvent[], now: Date): IcsEvent[] =>
  events.filter((event) => !isPastDue(event, now)).sort(byDueTime);
