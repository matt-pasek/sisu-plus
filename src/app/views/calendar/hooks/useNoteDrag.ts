import { useState, type MouseEvent, type PointerEvent } from 'react';
import type { HourRange } from '@/app/schedule';
import type { AnchorRect } from '../types';
import { doubleClickTimes, dragTimes, minutesToOffset, pointerToMinutes } from '../util';

interface Times {
  startMinutes: number;
  endMinutes: number;
}

interface Options {
  hourRange: HourRange;
  hourHeight: number;
  inset: number;
  onDraft: (times: Times, anchor: AnchorRect) => void;
}

export const useNoteDrag = ({ hourRange, hourHeight, inset, onDraft }: Options) => {
  const [drag, setDrag] = useState<{ from: number; to: number } | null>(null);
  const minutesAt = (element: HTMLElement, clientY: number): number =>
    pointerToMinutes(clientY - element.getBoundingClientRect().top - inset, hourRange, hourHeight);
  const anchorFor = (element: HTMLElement, times: Times): AnchorRect => {
    const rect = element.getBoundingClientRect();
    const top = rect.top + inset + minutesToOffset(times.startMinutes, hourRange, hourHeight);
    const bottom = rect.top + inset + minutesToOffset(times.endMinutes, hourRange, hourHeight);
    return { top, left: rect.left, right: rect.right, height: bottom - top };
  };

  // Only presses on the empty column start a note; blocks are children and handle their own clicks.
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || event.target !== event.currentTarget) return;
    const minutes = minutesAt(event.currentTarget, event.clientY);
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ from: minutes, to: minutes });
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag) return;
    setDrag({ ...drag, to: minutesAt(event.currentTarget, event.clientY) });
  };
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag) return;
    const times = dragTimes(drag.from, minutesAt(event.currentTarget, event.clientY));
    setDrag(null);
    if (times) onDraft(times, anchorFor(event.currentTarget, times));
  };
  const onPointerCancel = () => setDrag(null);
  const onDoubleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    const times = doubleClickTimes(minutesAt(event.currentTarget, event.clientY), hourRange);
    onDraft(times, anchorFor(event.currentTarget, times));
  };

  return {
    liveTimes: drag ? dragTimes(drag.from, drag.to) : null,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onDoubleClick },
  };
};
