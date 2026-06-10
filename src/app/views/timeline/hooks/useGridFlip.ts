import { useLayoutEffect, useRef } from 'react';

interface FlipRecord {
  left: number;
  top: number;
  width: number;
  height: number;
}

const FLIP_DURATION = 350;
const FLIP_EASING = 'cubic-bezier(0.2, 0, 0, 1)';

export const useGridFlip = <T extends HTMLElement>(key: string) => {
  const containerRef = useRef<T>(null);
  const positionsRef = useRef<Map<string, FlipRecord>>(new Map());

  const capturePositions = () => {
    const container = containerRef.current;
    if (!container) return;

    const next = new Map<string, FlipRecord>();
    const elements = container.querySelectorAll<HTMLElement>('[data-flip-id]');

    for (const el of elements) {
      const id = el.dataset.flipId!;
      next.set(id, {
        left: el.offsetLeft,
        top: el.offsetTop,
        width: el.offsetWidth,
        height: el.offsetHeight,
      });
    }

    positionsRef.current = next;
  };

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const elements = container.querySelectorAll<HTMLElement>('[data-flip-id]');
    const prev = positionsRef.current;

    for (const el of elements) {
      const id = el.dataset.flipId!;
      const old = prev.get(id);
      if (!old) continue;

      const dx = old.left - el.offsetLeft;
      const dy = old.top - el.offsetTop;
      const widthChanged = Math.abs(old.width - el.offsetWidth) > 1;

      if (Math.abs(dx) < 1 && Math.abs(dy) < 1 && !widthChanged) continue;

      const from: Keyframe = { transform: `translate(${dx}px, ${dy}px)` };
      const to: Keyframe = { transform: 'none' };

      if (widthChanged) {
        from.width = `${old.width}px`;
        to.width = `${el.offsetWidth}px`;
      }

      el.animate([from, to], { duration: FLIP_DURATION, easing: FLIP_EASING, fill: 'none' });
    }

    capturePositions();
  }, [key]);

  useLayoutEffect(() => {
    capturePositions();
  }, []);

  return containerRef;
};
