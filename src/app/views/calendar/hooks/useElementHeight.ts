import { useEffect, useState, type RefObject } from 'react';

export const useElementHeight = (ref: RefObject<HTMLElement | null>): number => {
  const [height, setHeight] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setHeight(entry.contentRect.height));
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return height;
};
