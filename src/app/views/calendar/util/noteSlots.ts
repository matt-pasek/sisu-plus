import {
  addDaysToDateKey,
  endMinutesOfDay,
  helsinkiMinutesOfDay,
  helsinkiWallTimeToInstant,
  type DateRange,
  type HourRange,
  type TimedBlock,
} from '@/app/schedule';
import type { NoteSlot } from '../types';

export const SLOT_MINUTES = 15;
export const DRAFT_BLOCK_ID = 'note-draft';

const NOTE_MINUTES = 60;
const FIRST_FREE_HOUR = 8;
const LAST_FREE_HOUR = 17;
const SEARCH_DAYS = 7;
const FALLBACK_START = 10 * 60;

export const pointerToMinutes = (offsetY: number, range: HourRange, hourHeight: number): number => {
  const raw = range.startHour * 60 + (offsetY / hourHeight) * 60;
  const snapped = Math.round(raw / SLOT_MINUTES) * SLOT_MINUTES;
  return Math.min(Math.max(snapped, range.startHour * 60), range.endHour * 60);
};

export const dragTimes = (
  fromMinutes: number,
  toMinutes: number,
): { startMinutes: number; endMinutes: number } | null => {
  const startMinutes = Math.min(fromMinutes, toMinutes);
  const endMinutes = Math.max(fromMinutes, toMinutes);
  return endMinutes - startMinutes >= SLOT_MINUTES ? { startMinutes, endMinutes } : null;
};

export const doubleClickTimes = (minutes: number, range: HourRange): { startMinutes: number; endMinutes: number } => {
  const floor = Math.floor(minutes / SLOT_MINUTES) * SLOT_MINUTES;
  const startMinutes = Math.max(range.startHour * 60, Math.min(floor, range.endHour * 60 - NOTE_MINUTES));
  return { startMinutes, endMinutes: startMinutes + NOTE_MINUTES };
};

const isFree = (busy: TimedBlock[], slot: NoteSlot): boolean =>
  !busy.some(
    (block) =>
      block.dateKey === slot.dateKey &&
      helsinkiMinutesOfDay(block.start) < slot.endMinutes &&
      endMinutesOfDay(block) > slot.startMinutes,
  );

export const nextFreeSlot = (busy: TimedBlock[], fromKey: string, now: Date | null): NoteSlot => {
  const nowMinutes = now ? helsinkiMinutesOfDay(now) : 0;
  const hours = Array.from({ length: LAST_FREE_HOUR - FIRST_FREE_HOUR + 1 }, (_, index) => FIRST_FREE_HOUR + index);
  const candidates = Array.from({ length: SEARCH_DAYS }, (_, day) => addDaysToDateKey(fromKey, day)).flatMap(
    (dateKey, day) =>
      hours
        .map((hour) => hour * 60)
        .filter((startMinutes) => day > 0 || startMinutes >= nowMinutes)
        .map((startMinutes): NoteSlot => ({ dateKey, startMinutes, endMinutes: startMinutes + NOTE_MINUTES })),
  );
  return (
    candidates.find((slot) => isFree(busy, slot)) ?? {
      dateKey: fromKey,
      startMinutes: FALLBACK_START,
      endMinutes: FALLBACK_START + NOTE_MINUTES,
    }
  );
};

export const slotInView = (busy: TimedBlock[], view: DateRange, todayKey: string, now: Date): NoteSlot => {
  const todayInView = todayKey >= view.startKey && todayKey < view.endKey;
  return nextFreeSlot(busy, todayInView ? todayKey : view.startKey, todayInView ? now : null);
};

export const slotBlock = (slot: NoteSlot): TimedBlock => ({
  id: DRAFT_BLOCK_ID,
  dateKey: slot.dateKey,
  start: helsinkiWallTimeToInstant(slot.dateKey, slot.startMinutes),
  end: helsinkiWallTimeToInstant(slot.dateKey, slot.endMinutes),
});
