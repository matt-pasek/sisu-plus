import { useLayoutEffect, useState, type RefObject } from 'react';

// Measured before paint, and the state only changes when the derived value does, so a width transition
// does not re-render on every frame.
export const useElementMeasure = <T>(
  ref: RefObject<HTMLElement | null>,
  measure: (width: number) => T,
  initial: T,
): T => {
  const [value, setValue] = useState(initial);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    setValue(measure(element.getBoundingClientRect().width));
    const observer = new ResizeObserver(([entry]) => setValue(measure(entry.contentRect.width)));
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, measure]);
  return value;
};
