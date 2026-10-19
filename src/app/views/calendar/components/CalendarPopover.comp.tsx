import React, { useEffect, useLayoutEffect, useRef, useState, type PropsWithChildren } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import type { AnchorRect } from '../types';
import { placePopover, restoreFocus } from '../util';

const DEFAULT_HEIGHT = 240;
const POPOVER_EASE = [0.22, 1, 0.36, 1] as const;

interface Props extends PropsWithChildren {
  anchor: AnchorRect;
  returnFocus: HTMLElement | null;
  fallbackFocus?: React.RefObject<HTMLElement>;
  ariaLabel: string;
  width: number;
  closeOnOutside: boolean;
  onClose: () => void;
}

export const CalendarPopover: React.FC<Props> = ({
  anchor,
  returnFocus,
  fallbackFocus,
  ariaLabel,
  width,
  closeOnOutside,
  onClose,
  children,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const focusTarget = useRef(returnFocus);
  const [height, setHeight] = useState(DEFAULT_HEIGHT);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    setHeight(element.offsetHeight);
    const observer = new ResizeObserver(() => setHeight(element.offsetHeight));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const target = ref.current?.querySelector<HTMLElement>('[data-autofocus]') ?? ref.current;
    target?.focus();
  }, []);

  useEffect(() => {
    focusTarget.current = returnFocus;
  }, [returnFocus]);

  const fallbackTarget = useRef(fallbackFocus);
  useEffect(() => () => restoreFocus(focusTarget.current, fallbackTarget.current?.current ?? null), []);

  // Clicks inside the shadow root reach document retargeted to the host, so containment is read from the path.
  useEffect(() => {
    if (!closeOnOutside) return undefined;
    const onPointerDown = (event: PointerEvent) => {
      const path = event.composedPath();
      if ((ref.current && path.includes(ref.current)) || (returnFocus && path.includes(returnFocus))) return;
      onClose();
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [closeOnOutside, returnFocus, onClose]);

  const placement = placePopover(anchor, { width, height }, { width: window.innerWidth, height: window.innerHeight });

  return (
    <motion.div
      ref={ref}
      role="dialog"
      aria-label={ariaLabel}
      tabIndex={-1}
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: shouldReduceMotion ? 0.1 : 0.16, ease: POPOVER_EASE }}
      className="fixed z-50 overflow-hidden rounded-[14px] bg-container shadow-[0_0_0_1px_rgba(255,255,255,0.09),0_24px_60px_rgba(0,0,0,0.6)] outline-none"
      style={{
        top: placement.top,
        left: placement.left,
        width,
        transformOrigin: placement.side === 'right' ? 'left center' : 'right center',
      }}
    >
      {children}
    </motion.div>
  );
};
