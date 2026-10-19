import { endMinutesOfDay, helsinkiMinutesOfDay, type HourRange, type TimedBlock } from '@/app/schedule';
import type { AnchorRect, PopoverPlacement, Size } from '../types';

const VIEWPORT_MARGIN = 8;

export const fitHourHeight = (available: number, hours: number, bounds: { min: number; max: number }): number => {
  if (available <= 0 || hours <= 0) return bounds.min;
  return Math.min(bounds.max, Math.max(bounds.min, Math.floor(available / hours)));
};

export const minutesToOffset = (minutes: number, range: HourRange, hourHeight: number): number =>
  ((minutes - range.startHour * 60) / 60) * hourHeight;

export const sessionBox = (
  block: TimedBlock,
  range: HourRange,
  hourHeight: number,
): { top: number; height: number } => {
  const top = minutesToOffset(helsinkiMinutesOfDay(block.start), range, hourHeight);
  return { top, height: minutesToOffset(endMinutesOfDay(block), range, hourHeight) - top };
};

export const placePopover = (anchor: AnchorRect, size: Size, viewport: Size, gap = 12): PopoverPlacement => {
  const fitsRight = anchor.right + gap + size.width <= viewport.width - VIEWPORT_MARGIN;
  const left = fitsRight ? anchor.right + gap : Math.max(VIEWPORT_MARGIN, anchor.left - gap - size.width);
  const centred = anchor.top + anchor.height / 2 - size.height / 2;
  const maxTop = Math.max(VIEWPORT_MARGIN, viewport.height - size.height - VIEWPORT_MARGIN);
  return { top: Math.min(Math.max(VIEWPORT_MARGIN, centred), maxTop), left, side: fitsRight ? 'right' : 'left' };
};
